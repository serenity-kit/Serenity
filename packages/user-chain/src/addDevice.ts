import sodium from "react-native-libsodium";
import { deviceEncryptionPublicKeyDomainContext } from "./constants";
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
  signingPublicKey: string;
  encryptionPublicKey: string;
  expiresAt?: Date;
};

export const addDevice = ({
  authorKeyPair,
  prevEvent,
  signingPublicKey,
  encryptionPublicKey,
  expiresAt,
}: Params): AddDeviceEvent => {
  const prevEventHash = hashEvent(prevEvent);
  const encryptionPublicKeySignature = sodium.crypto_sign_detached(
    deviceEncryptionPublicKeyDomainContext + encryptionPublicKey,
    sodium.from_base64(authorKeyPair.privateKey)
  );
  const transaction: AddDeviceTransaction = {
    type: "add-device",
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
