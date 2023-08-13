import sodium from "react-native-libsodium";
import { ZodError } from "zod";
import { getKeyPairsA, getKeyPairsB, KeyPairs } from "../test/testUtils";
import {
  createChain,
  InvalidUserChainError,
  resolveState,
  UnknownVersionUserChainError,
} from "./index";

let keyPairsA: KeyPairs;
let keyPairsB: KeyPairs;

beforeAll(async () => {
  await sodium.ready;
  keyPairsA = getKeyPairsA();
  keyPairsB = getKeyPairsB();
});

test("should resolve to one device after creating a chain", async () => {
  const event = createChain({
    authorKeyPair: keyPairsA.sign,
    encryptionPublicKey: keyPairsA.encryption.publicKey,
    email: "jane@example.com",
  });
  const state = resolveState({ events: [event], knownVersion: 0 });
  expect(state.currentState.devices).toMatchInlineSnapshot(`
    {
      "74IPzs2dhoERLRuxeS7zadzEvKfb7IqOK-jKu0mQxIM": {
        "encryptionPublicKey": "wevxDsZ-L7wpy3ePZcQNfG8WDh0wB0d27phr5OMdLwI",
        "expiresAt": undefined,
      },
    }
  `);
  expect(state.statePerEvent[state.currentState.eventHash]).toEqual(
    state.currentState
  );
  expect(state.currentState.email).toEqual("jane@example.com");
  expect(state.currentState.mainDeviceSigningPublicKey).toEqual(
    keyPairsA.sign.publicKey
  );
  expect(state.currentState.devices).toHaveProperty(
    state.currentState.mainDeviceSigningPublicKey
  );
  expect(typeof state.currentState.id).toBe("string");
  expect(typeof state.currentState.eventHash).toBe("string");
  expect(state.currentState.eventVersion).toBe(0);
});

test("should fail if two createChain events are applied", async () => {
  const event = createChain({
    authorKeyPair: keyPairsA.sign,
    encryptionPublicKey: keyPairsA.encryption.publicKey,
    email: "jane@example.com",
  });
  const event2 = createChain({
    authorKeyPair: keyPairsA.sign,
    encryptionPublicKey: keyPairsA.encryption.publicKey,
    email: "jane@example.com",
  });
  expect(() =>
    resolveState({ events: [event, event2], knownVersion: 0 })
  ).toThrow(ZodError);
});

test("should fail if the knownVersion is smaller than the actual event version", async () => {
  const event = createChain({
    authorKeyPair: keyPairsA.sign,
    encryptionPublicKey: keyPairsA.encryption.publicKey,
    email: "jane@example.com",
  });
  expect(() => resolveState({ events: [event], knownVersion: -1 })).toThrow(
    UnknownVersionUserChainError
  );
});

test("should fail if the signature has been manipulated", async () => {
  const event = createChain({
    authorKeyPair: keyPairsA.sign,
    encryptionPublicKey: keyPairsA.encryption.publicKey,
    email: "jane@example.com",
  });

  event.author.signature = sodium.to_base64(
    sodium.crypto_sign_detached(
      "something",
      sodium.from_base64(keyPairsB.sign.privateKey)
    )
  );
  expect(() => resolveState({ events: [event], knownVersion: 0 })).toThrow(
    InvalidUserChainError
  );
});

test("should fail if the encryptionPublicKeySignature has been manipulated", async () => {
  const event = createChain({
    authorKeyPair: keyPairsA.sign,
    encryptionPublicKey: keyPairsA.encryption.publicKey,
    email: "jane@example.com",
  });

  event.transaction.encryptionPublicKeySignature = sodium.to_base64(
    sodium.crypto_sign_detached(
      "something",
      sodium.from_base64(keyPairsB.sign.privateKey)
    )
  );
  expect(() => resolveState({ events: [event], knownVersion: 0 })).toThrow(
    InvalidUserChainError
  );
});
