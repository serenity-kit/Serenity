import canonicalize from "canonicalize";
import sodium from "react-native-libsodium";
import { Role } from "./types";

export type VerifyAcceptInvitationParams = {
  acceptInvitationSignature: string;
  acceptInvitationAuthorSignature: string;
  invitationSigningPublicKey: string;
  invitationId: string;
  mainDeviceSigningPublicKey: string;
  role: Role;
  workspaceId: string;
  expiresAt: Date;
};

export const verifyAcceptInvitation = ({
  acceptInvitationSignature,
  acceptInvitationAuthorSignature,
  invitationSigningPublicKey,
  invitationId,
  mainDeviceSigningPublicKey,
  role,
  workspaceId,
  expiresAt,
}: VerifyAcceptInvitationParams) => {
  const acceptInvitationData = canonicalize({
    workspaceId,
    invitationId,
    invitationSigningPublicKey,
    role,
    expiresAt: expiresAt.toISOString(),
    mainDeviceSigningPublicKey,
  });
  if (!acceptInvitationData) {
    throw new Error("Accept invitation data can't be canonicalized");
  }

  return (
    sodium.crypto_sign_verify_detached(
      sodium.from_base64(acceptInvitationSignature),
      acceptInvitationData,
      sodium.from_base64(invitationSigningPublicKey)
    ) &&
    sodium.crypto_sign_verify_detached(
      sodium.from_base64(acceptInvitationAuthorSignature),
      acceptInvitationData,
      sodium.from_base64(mainDeviceSigningPublicKey)
    )
  );
};
