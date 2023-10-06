import sodium from "react-native-libsodium";
import {
  DocumentChainEvent,
  KeyPairBase64,
  RemoveShareDeviceEvent,
  RemoveShareDeviceTransaction,
} from "./types";
import { hashEvent, hashTransaction } from "./utils";
import { version } from "./version";

type Params = {
  authorKeyPair: KeyPairBase64;
  prevEvent: DocumentChainEvent;
  signingPublicKey: string;
  expiresAt?: Date;
};

export const removeDevice = ({
  authorKeyPair,
  prevEvent,
  signingPublicKey,
}: Params): RemoveShareDeviceEvent => {
  const prevEventHash = hashEvent(prevEvent);
  const transaction: RemoveShareDeviceTransaction = {
    type: "remove-share-device",
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
