import { applyCreateDocumentChainEvent } from "./applyCreateDocumentChainEvent";
import { applyEvent } from "./applyEvent";
import { InvalidDocumentChainError } from "./errors";
import { DocumentChainEvent, DocumentChainState } from "./types";

type Params = {
  events: DocumentChainEvent[];
  knownVersion: number;
};

export type ResolvedDocumentChain = {
  currentState: DocumentChainState;
  statePerEvent: { [eventHash: string]: DocumentChainState };
};

export const resolveState = ({
  events,
  knownVersion,
}: Params): ResolvedDocumentChain => {
  if (events.length === 0) {
    throw new InvalidDocumentChainError("No events");
  }

  const statePerEvent = {};

  let state = applyCreateDocumentChainEvent({ event: events[0], knownVersion });
  statePerEvent[state.eventHash] = state;

  events.slice(1).forEach((event) => {
    state = applyEvent({ state, event, knownVersion });
    statePerEvent[state.eventHash] = state;
  });
  return {
    statePerEvent,
    currentState: state,
  };
};
