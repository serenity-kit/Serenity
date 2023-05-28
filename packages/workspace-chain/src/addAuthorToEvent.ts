import canonicalize from "canonicalize";
import sodium from "react-native-libsodium";
import { WorkspaceChainEvent } from "./types";
import { hashTransaction } from "./utils";

export const addAuthorToEvent = (
  event: WorkspaceChainEvent,
  authorKeyPair: sodium.KeyPair
): WorkspaceChainEvent => {
  const hash = hashTransaction(event.transaction);
  const message = canonicalize({
    prevHash: event.prevHash,
    hash,
  });
  if (typeof message !== "string") {
    throw new Error("Could not canonicalize hashes");
  }

  return {
    ...event,
    authors: [
      ...event.authors,
      {
        publicKey: sodium.to_base64(authorKeyPair.publicKey),
        signature: sodium.to_base64(
          sodium.crypto_sign_detached(message, authorKeyPair.privateKey)
        ),
      },
    ],
  };
};
