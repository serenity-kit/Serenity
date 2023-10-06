import sodium from "react-native-libsodium";
import {
  InvalidDocumentChainError,
  UnknownVersionDocumentChainError,
} from "./errors";
import {
  DocumentChainEvent,
  DocumentChainState,
  UpdateChainEvent,
} from "./types";
import { hashEvent, hashTransaction } from "./utils";
import { verifyDevice } from "./verifyDevice";

type Params = {
  state: DocumentChainState;
  event: DocumentChainEvent;
  knownVersion: number;
};

export const applyEvent = ({
  state,
  event: rawEvent,
  knownVersion,
}: Params): DocumentChainState => {
  const event = UpdateChainEvent.parse(rawEvent);

  const devices = { ...state.devices };
  const removedDevices = { ...state.removedDevices };

  const transactionHash = hashTransaction(event.transaction);
  const eventHash = hashEvent(event);
  const isValidSignature = sodium.crypto_sign_verify_detached(
    sodium.from_base64(event.author.signature),
    transactionHash,
    sodium.from_base64(event.author.publicKey)
  );
  if (!isValidSignature) {
    throw new InvalidDocumentChainError(
      `Invalid signature for document chain.`
    );
  }

  if (event.transaction.version > knownVersion) {
    throw new UnknownVersionDocumentChainError(
      `Document chain contains events with a version that yet can't be handled. Expected ${knownVersion} or lower, but got ${event.transaction.version}.`,
      event.transaction.version,
      knownVersion
    );
  }
  if (event.transaction.version < state.eventVersion) {
    throw new InvalidDocumentChainError(
      `Document chain contains events with a version that is lower than the current one. Expected ${state.eventVersion} or higher, but got ${event.transaction.version}.`
    );
  }

  if (state.eventHash !== event.transaction.prevEventHash) {
    throw new InvalidDocumentChainError(
      `Invalid prevEventHash for document chain. Expected ${state.eventHash} but got ${event.transaction.prevEventHash}.`
    );
  }

  if (event.transaction.type === "add-share-device") {
    if (devices.hasOwnProperty(event.transaction.signingPublicKey)) {
      throw new InvalidDocumentChainError("Device already exists.");
    }

    verifyDevice({
      signingPublicKey: event.author.publicKey,
      encryptionPublicKey: event.transaction.encryptionPublicKey,
      encryptionPublicKeySignature:
        event.transaction.encryptionPublicKeySignature,
    });

    devices[event.transaction.signingPublicKey] = {
      expiresAt: event.transaction.expiresAt,
      encryptionPublicKey: event.transaction.encryptionPublicKey,
    };
  }

  if (event.transaction.type === "remove-share-device") {
    if (!devices.hasOwnProperty(event.transaction.signingPublicKey)) {
      throw new InvalidDocumentChainError(
        "Failed to remove non-existing device."
      );
    }

    removedDevices[event.transaction.signingPublicKey] = {
      expiresAt: devices[event.transaction.signingPublicKey].expiresAt,
      encryptionPublicKey:
        devices[event.transaction.signingPublicKey].encryptionPublicKey,
    };
    delete devices[event.transaction.signingPublicKey];
  }

  return {
    id: state.id,
    devices,
    removedDevices,
    eventHash,
    eventVersion: event.transaction.version,
  };
};
