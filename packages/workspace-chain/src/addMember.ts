import sodium from "libsodium-wrappers";
import { AddMemberTransaction, DefaultTrustChainEvent, Role } from "./types";
import { hashTransaction } from "./utils";

export const addMember = (
  prevHash: string,
  authorKeyPair: sodium.KeyPair,
  memberSigningPublicKey: string,
  memberLockboxPublicKey: string,
  memberRole: Role
): DefaultTrustChainEvent => {
  const transaction: AddMemberTransaction = {
    type: "add-member",
    memberSigningPublicKey,
    memberLockboxPublicKey,
    role: memberRole,
  };

  const hash = hashTransaction(transaction);
  return {
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
    transaction,
    prevHash,
  };
};
