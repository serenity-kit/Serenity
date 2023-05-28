import { InvalidWorkspaceChainError } from "./errors";
import {
  CreateChainWorkspaceChainEvent,
  MemberProperties,
  WorkspaceChainState,
} from "./types";
import { hashTransaction, isValidCreateChainEvent } from "./utils";

export const applyCreateChainEvent = (
  event: CreateChainWorkspaceChainEvent
): WorkspaceChainState => {
  if (!isValidCreateChainEvent(event)) {
    throw new InvalidWorkspaceChainError("Invalid chain creation event.");
  }

  let members: { [publicKey: string]: MemberProperties } = {};
  if (event.authors.length !== 1) {
    throw new InvalidWorkspaceChainError("Invalid chain creation event.");
  }
  event.authors.forEach((author) => {
    members[author.publicKey] = {
      role: "ADMIN",
      addedBy: event.authors.map((author) => author.publicKey),
    };
  });

  return {
    id: event.transaction.id,
    invitations: {},
    members,
    lastEventHash: hashTransaction(event.transaction),
    encryptedStateClock: 0,
    workspaceChainVersion: 1,
  };
};
