import canonicalize from "canonicalize";
import sodium from "react-native-libsodium";
import {
  userDeviceEncryptionPublicKeyDomainContext,
  userDeviceSigningKeyProofDomainContext,
} from "./constants";
import {
  AddDeviceEvent,
  AddDeviceTransaction,
  KeyPairBase64,
  UserChainEvent,
} from "./types";
import { hashEvent, hashTransaction } from "./utils";
import { version } from "./version";

type Params = {
  authorKeyPair: KeyPairBase64;
  prevEvent: UserChainEvent;
  signingPrivateKey: string;
  signingPublicKey: string;
  encryptionPublicKey: string;
  expiresAt?: Date;
};

export const addDevice = ({
  authorKeyPair,
  prevEvent,
  signingPrivateKey,
  signingPublicKey,
  encryptionPublicKey,
  expiresAt,
}: Params): AddDeviceEvent => {
  const prevEventHash = hashEvent(prevEvent);
  const encryptionPublicKeySignature = sodium.crypto_sign_detached(
    userDeviceEncryptionPublicKeyDomainContext + encryptionPublicKey,
    sodium.from_base64(signingPrivateKey)
  );

  const deviceSigningContent = canonicalize({
    userDeviceSigningKeyProofDomainContext,
    prevEventHash,
  });
  if (!deviceSigningContent) {
    throw new Error("Failed to canonicalize device signing content");
  }

  const deviceSigningKeyProof = sodium.crypto_sign_detached(
    deviceSigningContent,
    sodium.from_base64(signingPrivateKey)
  );

  const transaction: AddDeviceTransaction = {
    type: "add-device",
    signingPublicKey,
    deviceSigningKeyProof: sodium.to_base64(deviceSigningKeyProof),
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
