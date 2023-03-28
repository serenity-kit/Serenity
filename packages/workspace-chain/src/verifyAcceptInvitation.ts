import canonicalize from "canonicalize";
import sodium from "react-native-libsodium";
import { Role } from "./types";

export type AcceptInvitationParams = {
  acceptInvitationSignature: string;
  invitationSigningPublicKey: string;
  invitationId: string;
  mainDeviceSigningPublicKey: string;
  mainDeviceEncryptionPublicKey: string;
  memberMainDeviceEncryptionPublicKeySignature: string;
  role: Role;
  workspaceId: string;
  expiresAt: Date;
};

export const verifyAcceptInvitation = ({
  acceptInvitationSignature,
  invitationSigningPublicKey,
  invitationId,
  mainDeviceSigningPublicKey,
  mainDeviceEncryptionPublicKey,
  memberMainDeviceEncryptionPublicKeySignature,
  role,
  workspaceId,
  expiresAt,
}: AcceptInvitationParams) => {
  const acceptInvitationData = canonicalize({
    workspaceId,
    invitationId,
    invitationSigningPublicKey,
    role,
    expiresAt: expiresAt.toISOString(),
    mainDeviceSigningPublicKey,
    mainDeviceEncryptionPublicKey,
    memberMainDeviceEncryptionPublicKeySignature,
  });
  if (!acceptInvitationData) {
    throw new Error("Accept invitation data can't be canonicalized");
  }

  return sodium.crypto_sign_verify_detached(
    sodium.from_base64(acceptInvitationSignature),
    acceptInvitationData,
    sodium.from_base64(invitationSigningPublicKey)
  );
};
