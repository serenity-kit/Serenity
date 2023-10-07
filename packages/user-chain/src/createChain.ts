import { generateId } from "@serenity-tools/common";
import sodium from "react-native-libsodium";
import { userDeviceEncryptionPublicKeyDomainContext } from "./constants";
import {
  CreateChainEvent,
  CreateChainTransaction,
  KeyPairBase64,
} from "./types";
import { hashTransaction } from "./utils";
import { version } from "./version";

type Params = {
  authorKeyPair: KeyPairBase64;
  encryptionPublicKey: string;
  email: string;
};

export const createChain = ({
  authorKeyPair,
  encryptionPublicKey,
  email,
}: Params): CreateChainEvent => {
  const encryptionPublicKeySignature = sodium.crypto_sign_detached(
    userDeviceEncryptionPublicKeyDomainContext + encryptionPublicKey,
    sodium.from_base64(authorKeyPair.privateKey)
  );
  const transaction: CreateChainTransaction = {
    type: "create",
    id: generateId(),
    encryptionPublicKey: encryptionPublicKey,
    encryptionPublicKeySignature: sodium.to_base64(
      encryptionPublicKeySignature
    ),
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
