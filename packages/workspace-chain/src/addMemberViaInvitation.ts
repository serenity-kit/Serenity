import canonicalize from "canonicalize";
import sodium from "react-native-libsodium";
import {
  AddMemberViaInvitationTransaction,
  DefaultTrustChainEvent,
  Role,
} from "./types";
import { hashTransaction } from "./utils";

type AddMemberViaInvitationParams = {
  prevHash: string;
  authorKeyPair: sodium.KeyPair;
  role: Role;
  acceptInvitationSignature: string;
  invitationSigningPublicKey: string;
  invitationId: string;
  mainDeviceSigningPublicKey: string;
  mainDeviceEncryptionPublicKey: string;
  memberMainDeviceEncryptionPublicKeySignature: string;
  workspaceId: string;
  expiresAt: Date;
};

export const addMemberViaInvitation = ({
  prevHash,
  authorKeyPair,
  role,
  acceptInvitationSignature,
  invitationSigningPublicKey,
  invitationId,
  mainDeviceSigningPublicKey,
  mainDeviceEncryptionPublicKey,
  memberMainDeviceEncryptionPublicKeySignature,
  workspaceId,
  expiresAt,
}: AddMemberViaInvitationParams): DefaultTrustChainEvent => {
  const transaction: AddMemberViaInvitationTransaction = {
    type: "add-member-via-invitation",
    memberMainDeviceSigningPublicKey: mainDeviceSigningPublicKey,
    memberMainDeviceEncryptionPublicKey: mainDeviceEncryptionPublicKey,
    role,
    memberMainDeviceEncryptionPublicKeySignature,
    acceptInvitationSignature,
    invitationSigningPublicKey,
    invitationId,
    workspaceId,
    expiresAt: expiresAt.toISOString(),
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
          sodium.crypto_sign_detached(message, authorKeyPair.privateKey)
        ),
      },
    ],
    transaction,
    prevHash,
  };
};
