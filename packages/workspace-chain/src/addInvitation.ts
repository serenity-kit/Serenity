import canonicalize from "canonicalize";
import sodium from "react-native-libsodium";
import {
  workspaceChainDomainContext,
  workspaceChainInvitationDomainContext,
} from "./constants";
import {
  AddInvitationTransaction,
  AddInvitationWorkspaceChainEvent,
  Role,
} from "./types";
import { hashTransaction } from "./utils";

type AddInvitationParams = {
  prevHash: string;
  authorKeyPair: sodium.KeyPair;
  expiresAt: Date;
  role: Role;
  workspaceId: string;
};

export type AddInvitationResult = AddInvitationWorkspaceChainEvent & {
  invitationSigningKeyPairSeed: string;
};

export const addInvitation = ({
  prevHash,
  authorKeyPair,
  expiresAt,
  role,
  workspaceId,
}: AddInvitationParams): AddInvitationResult => {
  const seed = sodium.randombytes_buf(sodium.crypto_sign_SEEDBYTES);
  const invitationSigningKeys = sodium.crypto_sign_seed_keypair(seed);
  const invitationSigningPublicKey = sodium.to_base64(
    invitationSigningKeys.publicKey
  );
  const invitationIdLengthBytes = 24;
  const invitationId = sodium.to_base64(
    sodium.randombytes_buf(invitationIdLengthBytes)
  );

  const invitationData = canonicalize({
    workspaceId,
    invitationId,
    invitationSigningPublicKey: sodium.to_base64(
      invitationSigningKeys.publicKey
    ),
    role,
    expiresAt: expiresAt.toISOString(),
  });

  if (!invitationData) {
    throw new Error("Invitation data can't be canonicalized");
  }

  const invitationDataSignature = sodium.crypto_sign_detached(
    workspaceChainInvitationDomainContext + invitationData,
    invitationSigningKeys.privateKey
  );

  const transaction: AddInvitationTransaction = {
    type: "add-invitation",
    invitationId,
    role,
    expiresAt: expiresAt.toISOString(),
    invitationSigningPublicKey,
    invitationDataSignature: sodium.to_base64(invitationDataSignature),
    workspaceId,
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
    invitationSigningKeyPairSeed: sodium.to_base64(seed),
  };
};
