import canonicalize from "canonicalize";
import sodium from "react-native-libsodium";
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
  const message = canonicalize({
    prevHash,
    hash,
  });
  if (typeof message !== "string") {
    throw new Error("Could not canonicalize hashes");
  }

  return {
    transaction,
    authors: [
      {
        publicKey: sodium.to_base64(authorKeyPair.publicKey),
        signature: sodium.to_base64(
          sodium.crypto_sign_detached(message, authorKeyPair.privateKey)
        ),
      },
    ],
    prevHash,
  };
};
