import { generateId } from "@serenity-tools/common";
import sodium from "react-native-libsodium";
import {
  CreateDocumentChainEvent,
  CreateDocumentChainTransaction,
  KeyPairBase64,
} from "./types";
import { hashTransaction } from "./utils";
import { version } from "./version";

type Params = {
  authorKeyPair: KeyPairBase64;
};

export const createDocumentChain = ({
  authorKeyPair,
}: Params): CreateDocumentChainEvent => {
  const transaction: CreateDocumentChainTransaction = {
    type: "create",
    id: generateId(),
    prevEventHash: null,
    version,
  };
  const hash = hashTransaction(transaction);

  return {
    transaction,
    author: {
      publicKey: authorKeyPair.publicKey,
      signature: sodium.to_base64(
        sodium.crypto_sign_detached(
          hash,
          sodium.from_base64(authorKeyPair.privateKey)
        )
      ),
    },
  };
};
