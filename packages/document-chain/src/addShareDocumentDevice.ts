import sodium from "react-native-libsodium";
import {
  documentChainDomainContext,
  shareDocumentDeviceEncryptionPublicKeyDomainContext,
} from "./constants";
import {
  AddShareDocumentDeviceEvent,
  AddShareDocumentDeviceTransaction,
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

export const addShareDocumentDevice = ({
  authorKeyPair,
  prevEvent,
  signingPublicKey,
  encryptionPublicKey,
  expiresAt,
  role,
}: Params): AddShareDocumentDeviceEvent => {
  const prevEventHash = hashEvent(prevEvent);
  const encryptionPublicKeySignature = sodium.crypto_sign_detached(
    shareDocumentDeviceEncryptionPublicKeyDomainContext + encryptionPublicKey,
    sodium.from_base64(authorKeyPair.privateKey)
  );
  const transaction: AddShareDocumentDeviceTransaction = {
    type: "add-share-document-device",
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
          documentChainDomainContext + hash,
          sodium.from_base64(authorKeyPair.privateKey)
        )
      ),
    },
  };
};
