import { generateId } from "@serenity-tools/common";
import sodium from "react-native-libsodium";
import { getKeyPairsA, getKeyPairsB, KeyPairs } from "../test/testUtils";
import {
  addDevice,
  AddDeviceEvent,
  AddDeviceTransaction,
  createChain,
  CreateChainEvent,
  CreateChainTransaction,
  hashEvent,
  hashTransaction,
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

test("should resolve to two devices after adding a device", async () => {
  const event = createChain({
    authorKeyPair: keyPairsA.sign,
    email: "jane@example.com",
  });
  const addDeviceEvent = addDevice({
    authorKeyPair: keyPairsA.sign,
    signingPublicKey: keyPairsB.sign.publicKey,
    prevEvent: event,
  });
  const state = resolveState({
    events: [event, addDeviceEvent],
    knownVersion: 0,
  });
  expect(state.currentState.devices).toMatchInlineSnapshot(`
    {
      "74IPzs2dhoERLRuxeS7zadzEvKfb7IqOK-jKu0mQxIM": {
        "expiresAt": undefined,
      },
      "MTDhqVIMflTD0Car-KSP1MWCIEYqs2LBaXfU20di0tY": {
        "expiresAt": undefined,
      },
    }
  `);
  expect(state.statePerEvent[state.currentState.eventHash]).toEqual(
    state.currentState
  );
  expect(state.currentState.mainDeviceSigningPublicKey).toEqual(
    keyPairsA.sign.publicKey
  );
  expect(typeof state.currentState.id).toBe("string");
  expect(typeof state.currentState.eventHash).toBe("string");
  expect(state.currentState.eventVersion).toBe(0);
});

test("should resolve to have a device with an expireAt", async () => {
  const event = createChain({
    authorKeyPair: keyPairsA.sign,
    email: "jane@example.com",
  });
  const addDeviceEvent = addDevice({
    authorKeyPair: keyPairsA.sign,
    signingPublicKey: keyPairsB.sign.publicKey,
    prevEvent: event,
    expiresAt: new Date("2030-01-01"),
  });
  const state = resolveState({
    events: [event, addDeviceEvent],
    knownVersion: 0,
  });
  expect(state.currentState.devices).toMatchInlineSnapshot(`
    {
      "74IPzs2dhoERLRuxeS7zadzEvKfb7IqOK-jKu0mQxIM": {
        "expiresAt": undefined,
      },
      "MTDhqVIMflTD0Car-KSP1MWCIEYqs2LBaXfU20di0tY": {
        "expiresAt": "2030-01-01T00:00:00.000Z",
      },
    }
  `);
});

test("should fail if an invalid expireAt is provided", async () => {
  const event = createChain({
    authorKeyPair: keyPairsA.sign,
    email: "jane@example.com",
  });
  expect(() =>
    addDevice({
      authorKeyPair: keyPairsA.sign,
      signingPublicKey: keyPairsB.sign.publicKey,
      prevEvent: event,
      // @ts-expect-error
      expiresAt: "2030-01-01T00:00:00.000Z",
    })
  ).toThrow(TypeError);
});

test("should fail if the same event is added twice", async () => {
  const event = createChain({
    authorKeyPair: keyPairsA.sign,
    email: "jane@example.com",
  });
  const addDeviceEvent = addDevice({
    authorKeyPair: keyPairsA.sign,
    signingPublicKey: keyPairsB.sign.publicKey,
    prevEvent: event,
  });
  const addDeviceEvent2 = addDevice({
    authorKeyPair: keyPairsA.sign,
    signingPublicKey: keyPairsB.sign.publicKey,
    prevEvent: addDeviceEvent,
  });
  expect(() =>
    resolveState({
      events: [event, addDeviceEvent, addDeviceEvent2],
      knownVersion: 0,
    })
  ).toThrow(InvalidUserChainError);
});

test("should fail if the signature has been manipulated", async () => {
  const event = createChain({
    authorKeyPair: keyPairsA.sign,
    email: "jane@example.com",
  });
  const addDeviceEvent = addDevice({
    authorKeyPair: keyPairsA.sign,
    signingPublicKey: keyPairsB.sign.publicKey,
    prevEvent: event,
  });

  addDeviceEvent.author.signature = sodium.to_base64(
    sodium.crypto_sign_detached(
      "something",
      sodium.from_base64(keyPairsB.sign.privateKey)
    )
  );

  expect(() =>
    resolveState({
      events: [event, addDeviceEvent],
      knownVersion: 0,
    })
  ).toThrow(InvalidUserChainError);
});

test("should fail if the author (publicKey and signature) have been replaced", async () => {
  const event = createChain({
    authorKeyPair: keyPairsA.sign,
    email: "jane@example.com",
  });
  const addDeviceEvent = addDevice({
    authorKeyPair: keyPairsA.sign,
    signingPublicKey: keyPairsB.sign.publicKey,
    prevEvent: event,
  });

  addDeviceEvent.author = {
    signature: sodium.to_base64(
      sodium.crypto_sign_detached(
        "something",
        sodium.from_base64(keyPairsB.sign.privateKey)
      )
    ),
    publicKey: keyPairsB.sign.publicKey,
  };

  expect(() =>
    resolveState({
      events: [event, addDeviceEvent],
      knownVersion: 0,
    })
  ).toThrow(InvalidUserChainError);
});

test("should fail if the knownVersion is smaller than the actual event version", async () => {
  const event = createChain({
    authorKeyPair: keyPairsA.sign,
    email: "jane@example.com",
  });

  const addDeviceWithVersion1 = ({
    authorKeyPair,
    prevEvent,
    signingPublicKey,
  }): AddDeviceEvent => {
    const prevEventHash = hashEvent(prevEvent);
    const transaction: AddDeviceTransaction = {
      type: "add-device",
      signingPublicKey,
      prevEventHash,
      version: 1,
    };
    const hash = hashTransaction(transaction);

    return {
      transaction,
      author: {
        publicKey: authorKeyPair.publicKey,
        signature: sodium.to_base64(
          sodium.crypto_sign_detached(
            hash,
            sodium.from_base64(authorKeyPair.privateKey)
          )
        ),
      },
    };
  };

  const addDeviceEvent = addDeviceWithVersion1({
    authorKeyPair: keyPairsA.sign,
    signingPublicKey: keyPairsB.sign.publicKey,
    prevEvent: event,
  });

  expect(() =>
    resolveState({
      events: [event, addDeviceEvent],
      knownVersion: 0,
    })
  ).toThrow(UnknownVersionUserChainError);
});

test("should fail if an old event version is applied after a newer one", async () => {
  const createChainWithVersion1 = ({
    authorKeyPair,
    email,
  }): CreateChainEvent => {
    const transaction: CreateChainTransaction = {
      type: "create",
      id: generateId(),
      prevEventHash: null,
      email,
      version: 1,
    };
    const hash = hashTransaction(transaction);

    return {
      transaction,
      author: {
        publicKey: authorKeyPair.publicKey,
        signature: sodium.to_base64(
          sodium.crypto_sign_detached(
            hash,
            sodium.from_base64(authorKeyPair.privateKey)
          )
        ),
      },
    };
  };

  const event = createChainWithVersion1({
    authorKeyPair: keyPairsA.sign,
    email: "jane@example.com",
  });
  const addDeviceEvent = addDevice({
    authorKeyPair: keyPairsA.sign,
    signingPublicKey: keyPairsB.sign.publicKey,
    prevEvent: event,
  });
  expect(() =>
    resolveState({ events: [event, addDeviceEvent], knownVersion: 1 })
  ).toThrow(InvalidUserChainError);
});

test("should fail if the chain is based on a different event", async () => {
  const event = createChain({
    authorKeyPair: keyPairsA.sign,
    email: "jane@example.com",
  });
  const event2 = createChain({
    authorKeyPair: keyPairsA.sign,
    email: "jane@example.com",
  });
  const addDeviceEvent = addDevice({
    authorKeyPair: keyPairsA.sign,
    signingPublicKey: keyPairsB.sign.publicKey,
    prevEvent: event2,
  });

  expect(() =>
    resolveState({
      events: [event, addDeviceEvent],
      knownVersion: 0,
    })
  ).toThrow(InvalidUserChainError);
});
