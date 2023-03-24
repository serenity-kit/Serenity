import sodium from "libsodium-wrappers";
import { TrustChainEvent } from "./types";
import { hashTransaction } from "./utils";

export const addAuthorToEvent = (
  event: TrustChainEvent,
  authorKeyPair: sodium.KeyPair
): TrustChainEvent => {
  const hash = hashTransaction(event.transaction);
  return {
    ...event,
    authors: [
      ...event.authors,
      {
        publicKey: sodium.to_base64(authorKeyPair.publicKey),
        signature:
          event.prevHash === null
            ? sodium.to_base64(
                sodium.crypto_sign_detached(hash, authorKeyPair.privateKey)
              )
            : sodium.to_base64(
                sodium.crypto_sign_detached(
                  `${event.prevHash}${hash}`,
                  authorKeyPair.privateKey
                )
              ),
      },
    ],
  };
};
