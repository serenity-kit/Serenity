import { InvalidAuthorWorkspaceChainError } from "./errors";
import { WorkspaceChainEvent } from "./types";

export const assertAuthorOfEvent = (
  event: WorkspaceChainEvent,
  signingPublicKey: string
) => {
  if (!event.authors.some((author) => author.publicKey === signingPublicKey)) {
    throw new InvalidAuthorWorkspaceChainError("Not an author of the event");
  }
};
