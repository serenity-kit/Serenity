import canonicalize from "canonicalize";
import sodium, { KeyPair } from "react-native-libsodium";
import { workspaceChainDomainContext } from "./constants";
import {
  AddMemberTransaction,
  AddMemberWorkspaceChainEvent,
  Role,
} from "./types";
import { hashTransaction } from "./utils";

export const addMember = (
  prevHash: string,
  authorKeyPair: KeyPair,
  memberMainDeviceSigningPublicKey: string,
  memberRole: Role
): AddMemberWorkspaceChainEvent => {
  const transaction: AddMemberTransaction = {
    type: "add-member",
    memberMainDeviceSigningPublicKey,
    role: memberRole,
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
    authors: [
      {
        publicKey: sodium.to_base64(authorKeyPair.publicKey),
        signature: sodium.to_base64(
          sodium.crypto_sign_detached(
            workspaceChainDomainContext + message,
            authorKeyPair.privateKey
          )
        ),
      },
    ],
    transaction,
    prevHash,
  };
};
