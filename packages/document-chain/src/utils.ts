import canonicalize from "canonicalize";
import sodium from "react-native-libsodium";
import { DocumentChainEvent } from "./types";

export const hashTransaction = (transaction) => {
  const value = canonicalize(transaction);
  if (!value) throw new Error("Failed to canonicalize the transaction");
  return sodium.to_base64(sodium.crypto_generichash(64, value));
};

export const hashEvent = (event: DocumentChainEvent) => {
  const value = canonicalize(event);
  if (!value)
    throw new Error("Failed to canonicalize the document chain event");
  return sodium.to_base64(sodium.crypto_generichash(64, value));
};
