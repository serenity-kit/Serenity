import canonicalize from "canonicalize";
import sodium, { KeyPair } from "react-native-libsodium";
import {
  workspaceChainAcceptInvitationDomainContext,
  workspaceChainDomainContext,
  workspaceChainInvitationDomainContext,
} from "./constants";
import {
  AcceptInvitationTransaction,
  AcceptInvitationWorkspaceChainEvent,
  Role,
} from "./types";
import { hashTransaction } from "./utils";

type AcceptInvitationParams = {
  prevHash: string;
  authorKeyPair: KeyPair;
  role: Role;
  invitationSigningPublicKey: string;
  invitationId: string;
  workspaceId: string;
  expiresAt: Date;
  invitationSigningKeyPairSeed: string;
  invitationDataSignature: string;
};

export const acceptInvitation = ({
  prevHash,
  authorKeyPair,
  role,
  invitationId,
  workspaceId,
  expiresAt,
  invitationSigningPublicKey,
  invitationSigningKeyPairSeed,
  invitationDataSignature,
}: AcceptInvitationParams): AcceptInvitationWorkspaceChainEvent => {
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
    workspaceChainInvitationDomainContext + invitationData,
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
  });
  if (!acceptInvitationData) {
    throw new Error("Accept invitation data can't be canonicalized");
  }

  const acceptInvitationSignature = sodium.crypto_sign_detached(
    workspaceChainAcceptInvitationDomainContext + acceptInvitationData,
    invitationSigningKeyPair.privateKey
  );

  const transaction: AcceptInvitationTransaction = {
    type: "accept-invitation",
    role,
    acceptInvitationSignature: sodium.to_base64(acceptInvitationSignature),
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
