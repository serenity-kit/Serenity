import sodium from "react-native-libsodium";
import { InvalidUserChainError, UnknownVersionUserChainError } from "./errors";
import {
  CreateChainEvent,
  DeviceInfo,
  UserChainEvent,
  UserChainState,
} from "./types";
import { hashEvent, hashTransaction } from "./utils";

type Params = {
  event: UserChainEvent;
  knownVersion: number;
};

export const applyCreateChainEvent = ({
  event: rawEvent,
  knownVersion,
}: Params): UserChainState => {
  const event = CreateChainEvent.parse(rawEvent);
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

  const devices: { [publicKey: string]: DeviceInfo } = {
    [event.author.publicKey]: { expiresAt: undefined },
  };

  return {
    id: event.transaction.id,
    devices,
    email: event.transaction.email,
    mainDeviceSigningPublicKey: event.author.publicKey,
    eventHash,
    eventVersion: event.transaction.version,
  };
};
