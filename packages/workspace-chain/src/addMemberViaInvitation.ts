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
  mainDeviceEncryptionPublicKeySignature: string;
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
  mainDeviceEncryptionPublicKeySignature,
  workspaceId,
  expiresAt,
}: AddMemberViaInvitationParams): DefaultTrustChainEvent => {
  const transaction: AddMemberViaInvitationTransaction = {
    type: "add-member-via-invitation",
    memberSigningPublicKey: mainDeviceSigningPublicKey,
    memberLockboxPublicKey: mainDeviceEncryptionPublicKey,
    role,
    mainDeviceEncryptionPublicKeySignature,
    acceptInvitationSignature,
    invitationSigningPublicKey,
    invitationId,
    workspaceId,
    expiresAt: expiresAt.toISOString(),
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
  };
};
