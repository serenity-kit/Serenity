import sodium from "react-native-libsodium";
import { v4 as uuidv4 } from "uuid";
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
    id: uuidv4(),
    lockboxPublicKeys,
  };
  const hash = hashTransaction(transaction);
  return {
    transaction,
    authors: [
      {
        publicKey: authorKeyPair.publicKey,
        signature: sodium.to_base64(
          sodium.crypto_sign_detached(
            hash,
            sodium.from_base64(authorKeyPair.privateKey)
          )
        ),
      },
    ],
    prevHash: null,
  };
};
