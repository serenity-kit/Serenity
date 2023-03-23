import sodium from "libsodium-wrappers";
import { InvalidTrustChainError } from "./errors";
import {
  DefaultTrustChainEvent,
  MemberProperties,
  TrustChainEvent,
  TrustChainState,
} from "./types";
import {
  allAuthorsAreValidAdmins,
  areValidPermissions,
  getAdminCount,
  hashTransaction,
  isValidAdminDecision,
} from "./utils";

export const applyEvent = (
  state: TrustChainState,
  event: TrustChainEvent
): TrustChainState => {
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

  if (event.transaction.type === "add-member") {
    if (event.transaction.isAdmin === true) {
      if (!isValidAdminDecision(state, event as DefaultTrustChainEvent)) {
        throw new InvalidTrustChainError("Not allowed to add an admin.");
      }
      members[event.transaction.memberSigningPublicKey] = {
        lockboxPublicKey: event.transaction.memberLockboxPublicKey,
        isAdmin: true,
        canAddMembers: true,
        canRemoveMembers: true,
        addedBy: event.authors.map((author) => author.publicKey),
      };
    } else {
      if (event.authors.length > 1) {
        // TODO add test for this
        throw new InvalidTrustChainError(
          "Only one author allowed when adding a non-admin member."
        );
      }
      if (
        !areValidPermissions(
          state,
          event as DefaultTrustChainEvent,
          "canAddMembers"
        )
      ) {
        throw new InvalidTrustChainError("Not allowed to add a member.");
      }
      if (
        event.transaction.canAddMembers === true &&
        !allAuthorsAreValidAdmins(state, event as DefaultTrustChainEvent)
      ) {
        throw new InvalidTrustChainError(
          "Not allowed to add a member with canAddMembers."
        );
      }
      if (
        event.transaction.canRemoveMembers === true &&
        !allAuthorsAreValidAdmins(state, event as DefaultTrustChainEvent)
      ) {
        throw new InvalidTrustChainError(
          "Not allowed to add a member with canRemoveMembers."
        );
      }
      members[event.transaction.memberSigningPublicKey] = {
        lockboxPublicKey: event.transaction.memberLockboxPublicKey,
        isAdmin: false,
        canAddMembers: event.transaction.canAddMembers,
        canRemoveMembers: event.transaction.canRemoveMembers,
        addedBy: [event.authors[0].publicKey],
      };
    }
  }

  if (event.transaction.type === "update-member") {
    if (
      !state.members.hasOwnProperty(event.transaction.memberSigningPublicKey)
    ) {
      throw new InvalidTrustChainError("Failed to update non-existing member.");
    }
    if (!allAuthorsAreValidAdmins(state, event as DefaultTrustChainEvent)) {
      throw new InvalidTrustChainError("Not allowed to update a member.");
    }

    if (
      state.members[event.transaction.memberSigningPublicKey].isAdmin &&
      event.transaction.isAdmin === false &&
      isValidAdminDecision(state, event as DefaultTrustChainEvent)
    ) {
      if (getAdminCount(state) <= 1) {
        throw new InvalidTrustChainError(
          "Not allowed to demote the last admin."
        );
      }

      // demote the admin to a member
      members[event.transaction.memberSigningPublicKey] = {
        lockboxPublicKey:
          members[event.transaction.memberSigningPublicKey].lockboxPublicKey,
        isAdmin: false,
        canAddMembers: event.transaction.canAddMembers,
        canRemoveMembers: event.transaction.canRemoveMembers,
        addedBy: members[event.transaction.memberSigningPublicKey].addedBy,
      };
    } else if (
      !state.members[event.transaction.memberSigningPublicKey].isAdmin &&
      event.transaction.isAdmin === true &&
      isValidAdminDecision(state, event as DefaultTrustChainEvent)
    ) {
      // promote the member to an admin
      members[event.transaction.memberSigningPublicKey] = {
        lockboxPublicKey:
          members[event.transaction.memberSigningPublicKey].lockboxPublicKey,
        isAdmin: true,
        canAddMembers: true,
        canRemoveMembers: true,
        addedBy: members[event.transaction.memberSigningPublicKey].addedBy,
      };
    } else if (
      !state.members[event.transaction.memberSigningPublicKey].isAdmin &&
      (state.members[event.transaction.memberSigningPublicKey].canAddMembers !==
        event.transaction.canAddMembers ||
        state.members[event.transaction.memberSigningPublicKey]
          .canRemoveMembers !== event.transaction.canRemoveMembers)
    ) {
      // promote the member to an admin
      members[event.transaction.memberSigningPublicKey] = {
        lockboxPublicKey:
          members[event.transaction.memberSigningPublicKey].lockboxPublicKey,
        isAdmin: false,
        canAddMembers: event.transaction.canAddMembers,
        canRemoveMembers: event.transaction.canRemoveMembers,
        addedBy: members[event.transaction.memberSigningPublicKey].addedBy,
      };
    } else {
      throw new InvalidTrustChainError("Not allowed member update.");
    }
  }

  if (event.transaction.type === "remove-member") {
    if (
      !state.members.hasOwnProperty(event.transaction.memberSigningPublicKey)
    ) {
      throw new InvalidTrustChainError("Failed to remove non-existing member.");
    }
    if (state.members[event.transaction.memberSigningPublicKey].isAdmin) {
      if (!isValidAdminDecision(state, event as DefaultTrustChainEvent)) {
        throw new InvalidTrustChainError("Not allowed to remove an admin.");
      }
      if (Object.keys(members).length <= 1) {
        throw new InvalidTrustChainError("Not allowed to remove last member.");
      }
      if (getAdminCount(state) <= 1) {
        throw new InvalidTrustChainError(
          "Not allowed to remove the last admin."
        );
      }
      delete members[event.transaction.memberSigningPublicKey];
    } else {
      if (
        !areValidPermissions(
          state,
          event as DefaultTrustChainEvent,
          "canRemoveMembers"
        )
      ) {
        throw new InvalidTrustChainError("Not allowed to remove a member.");
      }
      if (Object.keys(members).length <= 1) {
        throw new InvalidTrustChainError("Not allowed to remove last member.");
      }
      delete members[event.transaction.memberSigningPublicKey];
    }
  }

  return {
    id: state.id,
    members,
    lastEventHash: hash,
    trustChainVersion: 1,
    encryptedStateClock: state.encryptedStateClock,
  };
};
