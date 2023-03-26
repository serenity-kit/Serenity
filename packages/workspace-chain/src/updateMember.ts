import sodium from "react-native-libsodium";
import { DefaultTrustChainEvent, Role, UpdateMemberTransaction } from "./types";
import { hashTransaction } from "./utils";

export const updateMember = (
  prevHash: string,
  authorKeyPair: sodium.KeyPair,
  memberSigningPublicKey: string,
  memberRole: Role
): DefaultTrustChainEvent => {
  const transaction: UpdateMemberTransaction = {
    type: "update-member",
    memberSigningPublicKey,
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
