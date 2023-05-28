import { applyCreateChainEvent } from "./applyCreateChainEvent";
import { applyEvent } from "./applyEvent";
import { InvalidWorkspaceChainError } from "./errors";
import {
  CreateChainWorkspaceChainEvent,
  WorkspaceChainEvent,
  WorkspaceChainState,
} from "./types";

export const resolveState = (
  events: WorkspaceChainEvent[]
): WorkspaceChainState => {
  if (events.length === 0) {
    throw new InvalidWorkspaceChainError("No events");
  }
  let state = applyCreateChainEvent(
    events[0] as CreateChainWorkspaceChainEvent
  );
  events.slice(1).forEach((event) => {
    state = applyEvent(state, event);
  });
  return state;
};
