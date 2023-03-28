import canonicalize from "canonicalize";
import sodium from "react-native-libsodium";
import { Role } from "./types";

export type AcceptInvitationParams = {
  invitationSigningKeyPairSeed: string;
  invitationSigningPublicKey: string;
  invitationId: string;
  mainDeviceSigningPublicKey: string;
  mainDeviceEncryptionPublicKey: string;
  memberMainDeviceEncryptionPublicKeySignature: string;
  role: Role;
  workspaceId: string;
  expiresAt: Date;
  invitationDataSignature: string;
};

export const acceptInvitation = ({
  invitationSigningKeyPairSeed,
  invitationSigningPublicKey,
  invitationId,
  mainDeviceSigningPublicKey,
  mainDeviceEncryptionPublicKey,
  memberMainDeviceEncryptionPublicKeySignature,
  role,
  workspaceId,
  expiresAt,
  invitationDataSignature,
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
  // verify main device encryption public key signature
  const isValidMainDeviceEncryptionPublicKeySignature =
    sodium.crypto_sign_verify_detached(
      sodium.from_base64(memberMainDeviceEncryptionPublicKeySignature),
      mainDeviceEncryptionPublicKey,
      sodium.from_base64(mainDeviceSigningPublicKey)
    );
  if (!isValidMainDeviceEncryptionPublicKeySignature) {
    throw new Error("Main device encryption public key signature is invalid");
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
    mainDeviceSigningPublicKey,
    mainDeviceEncryptionPublicKey,
    memberMainDeviceEncryptionPublicKeySignature,
  });
  if (!acceptInvitationData) {
    throw new Error("Accept invitation data can't be canonicalized");
  }

  const acceptInvitationSignature = sodium.crypto_sign_detached(
    acceptInvitationData,
    invitationSigningKeyPair.privateKey
  );
  return acceptInvitationSignature;
};
