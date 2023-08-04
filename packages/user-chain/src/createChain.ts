import { generateId } from "@serenity-tools/common";
import sodium from "react-native-libsodium";
import {
  CreateChainEvent,
  CreateChainTransaction,
  KeyPairBase64,
} from "./types";
import { hashTransaction } from "./utils";
import { version } from "./version";

type Params = {
  authorKeyPair: KeyPairBase64;
  email: string;
};

export const createChain = ({
  authorKeyPair,
  email,
}: Params): CreateChainEvent => {
  const transaction: CreateChainTransaction = {
    type: "create",
    id: generateId(),
    prevEventHash: null,
    email,
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
