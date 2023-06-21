import canonicalize from "canonicalize";
import sodium from "react-native-libsodium";
import {
  RemoveInvitationsTransaction,
  RemoveInvitationsWorkspaceChainEvent,
} from "./types";
import { hashTransaction } from "./utils";

type RemoveInvitationsParam = {
  prevHash: string;
  authorKeyPair: sodium.KeyPair;
  invitationIds: string[];
};

export const removeInvitations = ({
  prevHash,
  authorKeyPair,
  invitationIds,
}: RemoveInvitationsParam): RemoveInvitationsWorkspaceChainEvent => {
  const transaction: RemoveInvitationsTransaction = {
    type: "remove-invitations",
    invitationIds,
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
