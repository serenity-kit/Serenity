import sodium from "libsodium-wrappers";
import { DefaultTrustChainEvent, RemoveMemberTransaction } from "./types";
import { hashTransaction } from "./utils";

export const removeMember = (
  prevHash: string,
  authorKeyPair: sodium.KeyPair,
  memberSigningPublicKey: string
): DefaultTrustChainEvent => {
  const transaction: RemoveMemberTransaction = {
    type: "remove-member",
    memberSigningPublicKey,
  };

  const hash = hashTransaction(transaction);
  return {
    transaction,
    authors: [
      {
        publicKey: sodium.to_base64(authorKeyPair.publicKey),
        signature: sodium.to_base64(
          sodium.crypto_sign_detached(
            `${prevHash}${hash}`,
            authorKeyPair.privateKey
          )
        ),
      },
    ],
    prevHash,
  };
};
