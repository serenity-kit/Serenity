import sodium from "react-native-libsodium";
import { InvalidTrustChainError } from "./errors";
import {
  DefaultTrustChainEvent,
  Invitation,
  MemberProperties,
  TrustChainEvent,
  TrustChainState,
} from "./types";
import { getAdminCount, hashTransaction, isValidAdminDecision } from "./utils";
import { verifyAcceptInvitation } from "./verifyAcceptInvitation";

export const applyEvent = (
  state: TrustChainState,
  event: TrustChainEvent
): TrustChainState => {
  let invitations: { [invitationId: string]: Invitation } = {
    ...state.invitations,
  };
  let members: { [publicKey: string]: MemberProperties } = {
    ...state.members,
  };
  const hash = hashTransaction(event.transaction);

  event.authors.forEach((author) => {
    if (
      !sodium.crypto_sign_verify_detached(
        sodium.from_base64(author.signature),
        `${state.lastEventHash}${hash}`,
        sodium.from_base64(author.publicKey)
      )
    ) {
      throw new InvalidTrustChainError(
        `Invalid signature for ${author.publicKey}.`
      );
    }
  });

  const publicKeys = event.authors.map((author) => author.publicKey);
  const hasDuplicatedAuthors = publicKeys.some((publicKey, index) => {
    return publicKeys.indexOf(publicKey) != index;
  });
  if (hasDuplicatedAuthors) {
    throw new InvalidTrustChainError("An author can sign the event only once.");
  }

  if (event.transaction.type === "create") {
    throw new InvalidTrustChainError("Only one create event is allowed.");
  }

  if (event.transaction.type === "add-invitation") {
    if (!isValidAdminDecision(state, event as DefaultTrustChainEvent)) {
      throw new InvalidTrustChainError("Not allowed to add an invitation.");
    }
    invitations[event.transaction.invitationId] = {
      expiresAt: event.transaction.expiresAt,
      role: event.transaction.role,
      invitationDataSignature: event.transaction.invitationDataSignature,
      invitationSigningPublicKey: event.transaction.invitationSigningPublicKey,
      addedBy: event.authors.map((author) => author.publicKey),
    };
  }

  if (event.transaction.type === "add-member") {
    if (!isValidAdminDecision(state, event as DefaultTrustChainEvent)) {
      throw new InvalidTrustChainError("Not allowed to add a member.");
    }

    if (members.hasOwnProperty(event.transaction.memberSigningPublicKey)) {
      throw new InvalidTrustChainError("Member already exists.");
    }

    members[event.transaction.memberSigningPublicKey] = {
      lockboxPublicKey: event.transaction.memberLockboxPublicKey,
      role: event.transaction.role,
      addedBy: event.authors.map((author) => author.publicKey),
    };
  }

  if (event.transaction.type === "add-member-via-invitation") {
    // check that the invitation exists in the current state
    if (!invitations.hasOwnProperty(event.transaction.invitationId)) {
      throw new InvalidTrustChainError("Invitation doesn't exist.");
    }

    event.authors.forEach((author) => {
      if (!members.hasOwnProperty(author.publicKey)) {
        throw new InvalidTrustChainError("Author is not a member.");
      }
    });

    const invitation = invitations[event.transaction.invitationId];
    invitation.invitationDataSignature;
    if (
      invitation.invitationSigningPublicKey !==
        event.transaction.invitationSigningPublicKey ||
      invitation.role !== event.transaction.role
    ) {
      throw new InvalidTrustChainError("Invitation invalid.");
    }

    if (members.hasOwnProperty(event.transaction.memberSigningPublicKey)) {
      throw new InvalidTrustChainError("Member already exists.");
    }

    const validInvitation = verifyAcceptInvitation({
      acceptInvitationSignature: event.transaction.acceptInvitationSignature,
      invitationSigningPublicKey: event.transaction.invitationSigningPublicKey,
      invitationId: event.transaction.invitationId,
      workspaceId: event.transaction.workspaceId,
      expiresAt: new Date(event.transaction.expiresAt),
      mainDeviceEncryptionPublicKey: event.transaction.memberLockboxPublicKey,
      mainDeviceSigningPublicKey: event.transaction.memberSigningPublicKey,
      mainDeviceEncryptionPublicKeySignature:
        event.transaction.mainDeviceEncryptionPublicKeySignature,
      role: event.transaction.role,
    });
    if (!validInvitation) {
      throw new InvalidTrustChainError(
        "Invalid add member via invitation event."
      );
    }

    members[event.transaction.memberSigningPublicKey] = {
      lockboxPublicKey: event.transaction.memberLockboxPublicKey,
      role: event.transaction.role,
      addedBy: event.authors.map((author) => author.publicKey),
    };
  }

  if (event.transaction.type === "update-member") {
    if (
      !state.members.hasOwnProperty(event.transaction.memberSigningPublicKey)
    ) {
      throw new InvalidTrustChainError("Failed to update non-existing member.");
    }
    if (!isValidAdminDecision(state, event as DefaultTrustChainEvent)) {
      throw new InvalidTrustChainError("Not allowed to update a member.");
    }

    if (
      getAdminCount(state) <= 1 &&
      event.transaction.role !== "ADMIN" &&
      members[event.transaction.memberSigningPublicKey].role === "ADMIN"
    ) {
      throw new InvalidTrustChainError("Not allowed to demote the last admin.");
    }

    if (
      members[event.transaction.memberSigningPublicKey].role ===
      event.transaction.role
    ) {
      throw new InvalidTrustChainError("Not allowed member update.");
    }

    members[event.transaction.memberSigningPublicKey] = {
      lockboxPublicKey:
        members[event.transaction.memberSigningPublicKey].lockboxPublicKey,
      role: event.transaction.role,
      addedBy: members[event.transaction.memberSigningPublicKey].addedBy,
    };
  }

  if (event.transaction.type === "remove-member") {
    if (
      !state.members.hasOwnProperty(event.transaction.memberSigningPublicKey)
    ) {
      throw new InvalidTrustChainError("Failed to remove non-existing member.");
    }
    if (!isValidAdminDecision(state, event as DefaultTrustChainEvent)) {
      throw new InvalidTrustChainError("Not allowed to remove a member.");
    }
    if (Object.keys(members).length <= 1) {
      throw new InvalidTrustChainError("Not allowed to remove last member.");
    }
    if (
      state.members[event.transaction.memberSigningPublicKey].role ===
        "ADMIN" &&
      getAdminCount(state) <= 1
    ) {
      throw new InvalidTrustChainError("Not allowed to remove the last admin.");
    }
    delete members[event.transaction.memberSigningPublicKey];
  }

  return {
    id: state.id,
    invitations,
    members,
    lastEventHash: hash,
    trustChainVersion: 1,
    encryptedStateClock: state.encryptedStateClock,
  };
};
