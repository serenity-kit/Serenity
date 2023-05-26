import canonicalize from "canonicalize";
import sodium from "react-native-libsodium";
import { InvalidWorkspaceChainError } from "./errors";
import {
  Invitation,
  MemberProperties,
  UpdateChainWorkspaceChainEvent,
  WorkspaceChainState,
} from "./types";
import { getAdminCount, hashTransaction, isValidAdminDecision } from "./utils";
import { verifyAcceptInvitation } from "./verifyAcceptInvitation";

export const applyEvent = (
  state: WorkspaceChainState,
  event: UpdateChainWorkspaceChainEvent
): WorkspaceChainState => {
  let invitations: { [invitationId: string]: Invitation } = {
    ...state.invitations,
  };
  let members: { [publicKey: string]: MemberProperties } = {
    ...state.members,
  };
  const hash = hashTransaction(event.transaction);
  const message = canonicalize({
    prevHash: state.lastEventHash,
    hash,
  });
  if (typeof message !== "string") {
    throw new Error("Could not canonicalize hashes");
  }

  event.authors.forEach((author) => {
    if (
      !sodium.crypto_sign_verify_detached(
        sodium.from_base64(author.signature),
        message,
        sodium.from_base64(author.publicKey)
      )
    ) {
      throw new InvalidWorkspaceChainError(
        `Invalid signature for ${author.publicKey}.`
      );
    }
  });

  const publicKeys = event.authors.map((author) => author.publicKey);
  const hasDuplicatedAuthors = publicKeys.some((publicKey, index) => {
    return publicKeys.indexOf(publicKey) != index;
  });
  if (hasDuplicatedAuthors) {
    throw new InvalidWorkspaceChainError(
      "An author can sign the event only once."
    );
  }

  // @ts-expect-error this is a safety check
  if (event.transaction.type === "create") {
    throw new InvalidWorkspaceChainError("Only one create event is allowed.");
  }

  if (event.transaction.type === "add-invitation") {
    if (!isValidAdminDecision(state, event)) {
      throw new InvalidWorkspaceChainError("Not allowed to add an invitation.");
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
    if (!isValidAdminDecision(state, event)) {
      throw new InvalidWorkspaceChainError("Not allowed to add a member.");
    }

    if (
      members.hasOwnProperty(event.transaction.memberMainDeviceSigningPublicKey)
    ) {
      throw new InvalidWorkspaceChainError("Member already exists.");
    }

    members[event.transaction.memberMainDeviceSigningPublicKey] = {
      role: event.transaction.role,
      addedBy: event.authors.map((author) => author.publicKey),
    };
  }

  if (event.transaction.type === "add-member-via-invitation") {
    // check that the invitation exists in the current state
    if (!invitations.hasOwnProperty(event.transaction.invitationId)) {
      throw new InvalidWorkspaceChainError("Invitation doesn't exist.");
    }

    event.authors.forEach((author) => {
      if (!members.hasOwnProperty(author.publicKey)) {
        throw new InvalidWorkspaceChainError("Author is not a member.");
      }
    });

    const invitation = invitations[event.transaction.invitationId];
    invitation.invitationDataSignature;
    if (
      invitation.invitationSigningPublicKey !==
        event.transaction.invitationSigningPublicKey ||
      invitation.role !== event.transaction.role
    ) {
      throw new InvalidWorkspaceChainError("Invitation invalid.");
    }

    if (
      members.hasOwnProperty(event.transaction.memberMainDeviceSigningPublicKey)
    ) {
      throw new InvalidWorkspaceChainError("Member already exists.");
    }

    const validInvitation = verifyAcceptInvitation({
      acceptInvitationSignature: event.transaction.acceptInvitationSignature,
      invitationSigningPublicKey: event.transaction.invitationSigningPublicKey,
      invitationId: event.transaction.invitationId,
      workspaceId: event.transaction.workspaceId,
      expiresAt: new Date(event.transaction.expiresAt),
      mainDeviceSigningPublicKey:
        event.transaction.memberMainDeviceSigningPublicKey,
      role: event.transaction.role,
    });
    if (!validInvitation) {
      throw new InvalidWorkspaceChainError(
        "Invalid add member via invitation event."
      );
    }

    members[event.transaction.memberMainDeviceSigningPublicKey] = {
      role: event.transaction.role,
      addedBy: event.authors.map((author) => author.publicKey),
    };
  }

  if (event.transaction.type === "update-member") {
    if (
      !state.members.hasOwnProperty(
        event.transaction.memberMainDeviceSigningPublicKey
      )
    ) {
      throw new InvalidWorkspaceChainError(
        "Failed to update non-existing member."
      );
    }
    if (!isValidAdminDecision(state, event)) {
      throw new InvalidWorkspaceChainError("Not allowed to update a member.");
    }

    if (
      getAdminCount(state) <= 1 &&
      event.transaction.role !== "ADMIN" &&
      members[event.transaction.memberMainDeviceSigningPublicKey].role ===
        "ADMIN"
    ) {
      throw new InvalidWorkspaceChainError(
        "Not allowed to demote the last admin."
      );
    }

    if (
      members[event.transaction.memberMainDeviceSigningPublicKey].role ===
      event.transaction.role
    ) {
      throw new InvalidWorkspaceChainError("Not allowed member update.");
    }

    members[event.transaction.memberMainDeviceSigningPublicKey] = {
      role: event.transaction.role,
      addedBy:
        members[event.transaction.memberMainDeviceSigningPublicKey].addedBy,
    };
  }

  if (event.transaction.type === "remove-member") {
    if (
      !state.members.hasOwnProperty(
        event.transaction.memberMainDeviceSigningPublicKey
      )
    ) {
      throw new InvalidWorkspaceChainError(
        "Failed to remove non-existing member."
      );
    }
    if (!isValidAdminDecision(state, event)) {
      throw new InvalidWorkspaceChainError("Not allowed to remove a member.");
    }
    if (Object.keys(members).length <= 1) {
      throw new InvalidWorkspaceChainError(
        "Not allowed to remove last member."
      );
    }
    if (
      state.members[event.transaction.memberMainDeviceSigningPublicKey].role ===
        "ADMIN" &&
      getAdminCount(state) <= 1
    ) {
      throw new InvalidWorkspaceChainError(
        "Not allowed to remove the last admin."
      );
    }
    delete members[event.transaction.memberMainDeviceSigningPublicKey];
  }

  return {
    id: state.id,
    invitations,
    members,
    lastEventHash: hash,
    workspaceChainVersion: 1,
    encryptedStateClock: state.encryptedStateClock,
  };
};
