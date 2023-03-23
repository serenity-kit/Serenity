import { InvalidTrustChainError } from "./errors";
import {
  CreateChainTrustChainEvent,
  MemberProperties,
  TrustChainState,
} from "./types";
import { hashTransaction, isValidCreateChainEvent } from "./utils";

export const applyCreateChainEvent = (
  event: CreateChainTrustChainEvent
): TrustChainState => {
  if (!isValidCreateChainEvent(event)) {
    throw new InvalidTrustChainError("Invalid chain creation event.");
  }

  let members: { [publicKey: string]: MemberProperties } = {};
  event.authors.forEach((author) => {
    members[author.publicKey] = {
      lockboxPublicKey: event.transaction.lockboxPublicKeys[author.publicKey],
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
    trustChainVersion: 1,
  };
};
