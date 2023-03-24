import { applyEvent } from ".";
import { applyCreateChainEvent } from "./applyCreateChainEvent";
import { InvalidTrustChainError } from "./errors";
import {
  CreateChainTrustChainEvent,
  TrustChainEvent,
  TrustChainState,
} from "./types";

export const resolveState = (events: TrustChainEvent[]): TrustChainState => {
  if (events.length === 0) {
    throw new InvalidTrustChainError("No events");
  }
  let state = applyCreateChainEvent(events[0] as CreateChainTrustChainEvent);
  events.slice(1).forEach((event) => {
    state = applyEvent(state, event);
  });
  return state;
};
