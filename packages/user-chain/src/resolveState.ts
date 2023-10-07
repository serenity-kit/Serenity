import { applyCreateUserChainEvent } from "./applyCreateUserChainEvent";
import { applyEvent } from "./applyEvent";
import { InvalidUserChainError } from "./errors";
import { UserChainEvent, UserChainState } from "./types";

type Params = {
  events: UserChainEvent[];
  knownVersion: number;
};

type ReturnType = {
  currentState: UserChainState;
  statePerEvent: { [eventHash: string]: UserChainState };
};

export const resolveState = ({ events, knownVersion }: Params): ReturnType => {
  if (events.length === 0) {
    throw new InvalidUserChainError("No events");
  }

  const statePerEvent = {};

  let state = applyCreateUserChainEvent({ event: events[0], knownVersion });
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
