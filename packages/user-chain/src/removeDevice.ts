import sodium from "react-native-libsodium";
import {
  KeyPairBase64,
  RemoveDeviceEvent,
  RemoveDeviceTransaction,
  UserChainEvent,
} from "./types";
import { hashEvent, hashTransaction } from "./utils";
import { version } from "./version";

type Params = {
  authorKeyPair: KeyPairBase64;
  prevEvent: UserChainEvent;
  signingPublicKey: string;
  expiresAt?: Date;
};

export const removeDevice = ({
  authorKeyPair,
  prevEvent,
  signingPublicKey,
}: Params): RemoveDeviceEvent => {
  const prevEventHash = hashEvent(prevEvent);
  const transaction: RemoveDeviceTransaction = {
    type: "remove-device",
    signingPublicKey,
    prevEventHash,
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
