import { generateId } from "@naisho/core";
import canonicalize from "canonicalize";
import sodium from "react-native-libsodium";
import {
  CreateChainTransaction,
  CreateChainTrustChainEvent,
  KeyPairBase64,
} from "./types";
import { hashTransaction } from "./utils";

export const createChain = (
  authorKeyPair: KeyPairBase64,
  lockboxPublicKeys: { [signingPublicKey: string]: string }
): CreateChainTrustChainEvent => {
  const transaction: CreateChainTransaction = {
    type: "create",
    id: generateId(),
    lockboxPublicKeys,
  };
  const hash = hashTransaction(transaction);
  const message = canonicalize({
    prevHash: null,
    hash,
  });
  if (typeof message !== "string") {
    throw new Error("Could not canonicalize hashes");
  }

  return {
    transaction,
    authors: [
      {
        publicKey: authorKeyPair.publicKey,
        signature: sodium.to_base64(
          sodium.crypto_sign_detached(
            message,
            sodium.from_base64(authorKeyPair.privateKey)
          )
        ),
      },
    ],
    prevHash: null,
  };
};
