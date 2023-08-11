import sodium from "react-native-libsodium";
import { InvalidUserChainError, UnknownVersionUserChainError } from "./errors";
import { UpdateChainEvent, UserChainEvent, UserChainState } from "./types";
import { hashEvent, hashTransaction } from "./utils";

type Params = {
  state: UserChainState;
  event: UserChainEvent;
  knownVersion: number;
};

export const applyEvent = ({
  state,
  event: rawEvent,
  knownVersion,
}: Params): UserChainState => {
  const event = UpdateChainEvent.parse(rawEvent);

  const devices = { ...state.devices };

  const transactionHash = hashTransaction(event.transaction);
  const eventHash = hashEvent(event);
  const isValidSignature = sodium.crypto_sign_verify_detached(
    sodium.from_base64(event.author.signature),
    transactionHash,
    sodium.from_base64(event.author.publicKey)
  );
  if (!isValidSignature) {
    throw new InvalidUserChainError(`Invalid signature for user chain.`);
  }

  if (event.transaction.version > knownVersion) {
    throw new UnknownVersionUserChainError(
      `User chain contains events with a version that yet can't be handled. Expected ${knownVersion} or lower, but got ${event.transaction.version}.`,
      event.transaction.version,
      knownVersion
    );
  }
  if (event.transaction.version < state.eventVersion) {
    throw new InvalidUserChainError(
      `User chain contains events with a version that is lower than the current one. Expected ${state.eventVersion} or higher, but got ${event.transaction.version}.`
    );
  }

  if (state.eventHash !== event.transaction.prevEventHash) {
    throw new InvalidUserChainError(
      `Invalid prevEventHash for user chain. Expected ${state.eventHash} but got ${event.transaction.prevEventHash}.`
    );
  }

  if (event.transaction.type === "add-device") {
    if (devices.hasOwnProperty(event.transaction.signingPublicKey)) {
      throw new InvalidUserChainError("Device already exists.");
    }

    devices[event.transaction.signingPublicKey] = {
      expiresAt: event.transaction.expiresAt,
    };
  }

  if (event.transaction.type === "remove-device") {
    if (!devices.hasOwnProperty(event.transaction.signingPublicKey)) {
      throw new InvalidUserChainError("Failed to remove non-existing device.");
    }

    if (
      event.transaction.signingPublicKey === state.mainDeviceSigningPublicKey
    ) {
      throw new InvalidUserChainError(
        "Failed to remove the main device. This is not possible."
      );
    }

    delete devices[event.transaction.signingPublicKey];
  }

  return {
    id: state.id,
    devices,
    email: state.email,
    mainDeviceSigningPublicKey: state.mainDeviceSigningPublicKey,
    eventHash,
    eventVersion: event.transaction.version,
  };
};
