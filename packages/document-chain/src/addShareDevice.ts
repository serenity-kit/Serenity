import sodium from "react-native-libsodium";
import { deviceEncryptionPublicKeyDomainContext } from "./constants";
import {
  AddShareDeviceEvent,
  AddShareDeviceTransaction,
  DocumentChainEvent,
  DocumentShareRole,
  KeyPairBase64,
} from "./types";
import { hashEvent, hashTransaction } from "./utils";
import { version } from "./version";

type Params = {
  authorKeyPair: KeyPairBase64;
  prevEvent: DocumentChainEvent;
  signingPublicKey: string;
  encryptionPublicKey: string;
  role: DocumentShareRole;
  expiresAt?: Date;
};

export const addShareDevice = ({
  authorKeyPair,
  prevEvent,
  signingPublicKey,
  encryptionPublicKey,
  expiresAt,
  role,
}: Params): AddShareDeviceEvent => {
  const prevEventHash = hashEvent(prevEvent);
  const encryptionPublicKeySignature = sodium.crypto_sign_detached(
    deviceEncryptionPublicKeyDomainContext + encryptionPublicKey,
    sodium.from_base64(authorKeyPair.privateKey)
  );
  const transaction: AddShareDeviceTransaction = {
    type: "add-share-device",
    role,
    signingPublicKey,
    encryptionPublicKey,
    encryptionPublicKeySignature: sodium.to_base64(
      encryptionPublicKeySignature
    ),
    prevEventHash,
    expiresAt: expiresAt ? expiresAt.toISOString() : undefined,
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
