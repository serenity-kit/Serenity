import canonicalize from "canonicalize";
import sodium from "react-native-libsodium";
import { Role } from "./types";

export type AcceptInvitationParams = {
  invitationSigningKeyPairSeed: string;
  invitationSigningPublicKey: string;
  invitationId: string;
  role: Role;
  workspaceId: string;
  expiresAt: Date;
  invitationDataSignature: string;
  authorKeyPair: sodium.KeyPair;
};

export const acceptInvitation = ({
  invitationSigningKeyPairSeed,
  invitationSigningPublicKey,
  invitationId,
  role,
  workspaceId,
  expiresAt,
  invitationDataSignature,
  authorKeyPair,
}: AcceptInvitationParams) => {
  const invitationSigningKeyPair = sodium.crypto_sign_seed_keypair(
    sodium.from_base64(invitationSigningKeyPairSeed)
  );
  if (
    sodium.to_base64(invitationSigningKeyPair.publicKey) !==
    invitationSigningPublicKey
  ) {
    throw new Error("Invitation signing public key doesn't match the seed");
  }

  // verify invitation data signature
  const invitationData = canonicalize({
    workspaceId,
    invitationId,
    invitationSigningPublicKey,
    role,
    expiresAt: expiresAt.toISOString(),
  });
  if (!invitationData) {
    throw new Error("Invitation data can't be canonicalized");
  }
  const invitationDataSignatureVerified = sodium.crypto_sign_verify_detached(
    sodium.from_base64(invitationDataSignature),
    invitationData,
    sodium.from_base64(invitationSigningPublicKey)
  );
  if (!invitationDataSignatureVerified) {
    throw new Error("Invitation data signature is invalid");
  }

  if (new Date() >= expiresAt) {
    throw new Error("Invitation has expired");
  }

  const acceptInvitationData = canonicalize({
    workspaceId,
    invitationId,
    invitationSigningPublicKey,
    role,
    expiresAt: expiresAt.toISOString(),
    mainDeviceSigningPublicKey: sodium.to_base64(authorKeyPair.publicKey),
  });
  if (!acceptInvitationData) {
    throw new Error("Accept invitation data can't be canonicalized");
  }

  const acceptInvitationSignature = sodium.crypto_sign_detached(
    acceptInvitationData,
    invitationSigningKeyPair.privateKey
  );
  const acceptInvitationAuthorSignature = sodium.crypto_sign_detached(
    acceptInvitationData,
    authorKeyPair.privateKey
  );
  return {
    acceptInvitationSignature,
    acceptInvitationAuthorSignature,
  };
};
