import sodium from "react-native-libsodium";
import { documentChainDomainContext } from "./constants";
import {
  InvalidDocumentChainError,
  UnknownVersionDocumentChainError,
} from "./errors";
import {
  CreateDocumentChainEvent,
  DocumentChainEvent,
  DocumentChainState,
} from "./types";
import { hashEvent, hashTransaction } from "./utils";

type Params = {
  event: DocumentChainEvent;
  knownVersion: number;
};

export const applyCreateDocumentChainEvent = ({
  event: rawEvent,
  knownVersion,
}: Params): DocumentChainState => {
  const event = CreateDocumentChainEvent.parse(rawEvent);
  const transactionHash = hashTransaction(event.transaction);
  const eventHash = hashEvent(event);
  const isValidSignature = sodium.crypto_sign_verify_detached(
    sodium.from_base64(event.author.signature),
    documentChainDomainContext + transactionHash,
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

  return {
    id: event.transaction.id,
    devices: {},
    removedDevices: {},
    eventHash,
    eventVersion: event.transaction.version,
  };
};
