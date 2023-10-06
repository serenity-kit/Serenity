import sodium from "react-native-libsodium";
import { ZodError } from "zod";
import { getKeyPairsA, getKeyPairsB, KeyPairs } from "../test/testUtils";
import {
  createChain,
  InvalidDocumentChainError,
  resolveState,
  UnknownVersionDocumentChainError,
} from "./index";

let keyPairsA: KeyPairs;
let keyPairsB: KeyPairs;

beforeAll(async () => {
  await sodium.ready;
  keyPairsA = getKeyPairsA();
  keyPairsB = getKeyPairsB();
});

test("should resolve to no share device entry after creating a chain", async () => {
  const event = createChain({
    authorKeyPair: keyPairsA.sign,
  });
  const state = resolveState({ events: [event], knownVersion: 0 });
  expect(state.currentState.devices).toMatchInlineSnapshot(`{}`);
  expect(state.currentState.removedDevices).toMatchInlineSnapshot(`{}`);
  expect(state.statePerEvent[state.currentState.eventHash]).toEqual(
    state.currentState
  );
  expect(typeof state.currentState.id).toBe("string");
  expect(typeof state.currentState.eventHash).toBe("string");
  expect(state.currentState.eventVersion).toBe(0);
});

test("should fail if two createChain events are applied", async () => {
  const event = createChain({
    authorKeyPair: keyPairsA.sign,
  });
  const event2 = createChain({
    authorKeyPair: keyPairsA.sign,
  });
  expect(() =>
    resolveState({ events: [event, event2], knownVersion: 0 })
  ).toThrow(ZodError);
});

test("should fail if the knownVersion is smaller than the actual event version", async () => {
  const event = createChain({
    authorKeyPair: keyPairsA.sign,
  });
  expect(() => resolveState({ events: [event], knownVersion: -1 })).toThrow(
    UnknownVersionDocumentChainError
  );
});

test("should fail if the signature has been manipulated", async () => {
  const event = createChain({
    authorKeyPair: keyPairsA.sign,
  });

  event.author.signature = sodium.to_base64(
    sodium.crypto_sign_detached(
      "something",
      sodium.from_base64(keyPairsB.sign.privateKey)
    )
  );
  expect(() => resolveState({ events: [event], knownVersion: 0 })).toThrow(
    InvalidDocumentChainError
  );
});
