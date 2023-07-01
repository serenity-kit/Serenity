import sodium from "react-native-libsodium";
import {
  AddDeviceEvent,
  AddDeviceTransaction,
  KeyPairBase64,
  UserChainEvent,
} from "./types";
import { hashEvent, hashTransaction } from "./utils";

type Params = {
  authorKeyPair: KeyPairBase64;
  prevEvent: UserChainEvent;
  devicePublicKey: string;
  expiresAt?: Date;
};

export const addDevice = ({
  authorKeyPair,
  prevEvent,
  devicePublicKey,
  expiresAt,
}: Params): AddDeviceEvent => {
  const prevEventHash = hashEvent(prevEvent);
  const transaction: AddDeviceTransaction = {
    type: "add-device",
    devicePublicKey,
    prevEventHash,
    expiresAt: expiresAt ? expiresAt.toISOString() : undefined,
    version: 0,
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
