import canonicalize from "canonicalize";
import sodium from "libsodium-wrappers";
import {
  AddInvitationTransaction,
  DefaultTrustChainEvent,
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

export const addInvitation = ({
  prevHash,
  authorKeyPair,
  expiresAt,
  role,
  workspaceId,
}: AddInvitationParams): DefaultTrustChainEvent & {
  invitationSigningPrivateKey: string;
} => {
  const invitationSigningKeys = sodium.crypto_sign_keypair();
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
  const invitationDataSignature = sodium.crypto_sign_detached(
    invitationData!,
    invitationSigningKeys.privateKey
  );

  const transaction: AddInvitationTransaction = {
    type: "add-invitation",
    invitationId,
    role,
    expiresAt: expiresAt.toISOString(),
    invitationSigningPublicKey,
    invitationDataSignature: sodium.to_base64(invitationDataSignature),
  };

  const hash = hashTransaction(transaction);
  return {
    authors: [
      {
        publicKey: sodium.to_base64(authorKeyPair.publicKey),
        signature: sodium.to_base64(
          sodium.crypto_sign_detached(
            `${prevHash}${hash}`,
            authorKeyPair.privateKey
          )
        ),
      },
    ],
    transaction,
    prevHash,
    invitationSigningPrivateKey: sodium.to_base64(
      invitationSigningKeys.privateKey
    ),
  };
};
