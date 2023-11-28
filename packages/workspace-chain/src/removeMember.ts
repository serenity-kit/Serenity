import canonicalize from "canonicalize";
import sodium, { KeyPair } from "react-native-libsodium";
import { workspaceChainDomainContext } from "./constants";
import {
  RemoveMemberTransaction,
  RemoveMemberWorkspaceChainEvent,
} from "./types";
import { hashTransaction } from "./utils";

export const removeMember = (
  prevHash: string,
  authorKeyPair: KeyPair,
  memberMainDeviceSigningPublicKey: string
): RemoveMemberWorkspaceChainEvent => {
  const transaction: RemoveMemberTransaction = {
    type: "remove-member",
    memberMainDeviceSigningPublicKey,
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
          sodium.crypto_sign_detached(
            workspaceChainDomainContext + message,
            authorKeyPair.privateKey
          )
        ),
      },
    ],
    prevHash,
  };
};
