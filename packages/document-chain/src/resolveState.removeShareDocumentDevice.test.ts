import sodium from "react-native-libsodium";
import { getKeyPairsA, getKeyPairsB, KeyPairs } from "../test/testUtils";
import {
  addShareDocumentDevice,
  createDocumentChain,
  InvalidDocumentChainError,
  removeShareDocumentDevice,
  resolveState,
} from "./index";

let keyPairsA: KeyPairs;
let keyPairsB: KeyPairs;

beforeAll(async () => {
  await sodium.ready;
  keyPairsA = getKeyPairsA();
  keyPairsB = getKeyPairsB();
});

test("should resolve to no share device after adding and removing a share device", async () => {
  const event = createDocumentChain({
    authorKeyPair: keyPairsA.sign,
  });
  const addShareDocumentDeviceEvent = addShareDocumentDevice({
    authorKeyPair: keyPairsA.sign,
    signingPublicKey: keyPairsB.sign.publicKey,
    encryptionPublicKey: keyPairsB.encryption.publicKey,
    role: "EDITOR",
    prevEvent: event,
  });
  const removeShareDocumentDeviceEvent = removeShareDocumentDevice({
    authorKeyPair: keyPairsA.sign,
    signingPublicKey: keyPairsB.sign.publicKey,
    prevEvent: addShareDocumentDeviceEvent,
  });
  const state = resolveState({
    events: [
      event,
      addShareDocumentDeviceEvent,
      removeShareDocumentDeviceEvent,
    ],
    knownVersion: 0,
  });
  expect(state.currentState.devices).toMatchInlineSnapshot(`{}`);
  expect(state.currentState.removedDevices).toMatchInlineSnapshot(`
    {
      "MTDhqVIMflTD0Car-KSP1MWCIEYqs2LBaXfU20di0tY": {
        "encryptionPublicKey": "b_skeL8qudNQji-HuOldPNFDzYSBENNqmFMlawhtrHg",
        "expiresAt": undefined,
        "role": "EDITOR",
      },
    }
  `);
  expect(state.statePerEvent[state.currentState.eventHash]).toEqual(
    state.currentState
  );
  expect(typeof state.currentState.id).toBe("string");
  expect(typeof state.currentState.eventHash).toBe("string");
  expect(state.currentState.eventVersion).toBe(0);
});

test("should fail if a device is removed twice", async () => {
  const event = createDocumentChain({
    authorKeyPair: keyPairsA.sign,
  });
  const addShareDocumentDeviceEvent = addShareDocumentDevice({
    authorKeyPair: keyPairsA.sign,
    signingPublicKey: keyPairsB.sign.publicKey,
    encryptionPublicKey: keyPairsB.encryption.publicKey,
    role: "EDITOR",
    prevEvent: event,
  });
  const removeShareDocumentDeviceEvent = removeShareDocumentDevice({
    authorKeyPair: keyPairsA.sign,
    signingPublicKey: keyPairsB.sign.publicKey,
    prevEvent: addShareDocumentDeviceEvent,
  });
  const removeShareDocumentDeviceEvent2 = removeShareDocumentDevice({
    authorKeyPair: keyPairsA.sign,
    signingPublicKey: keyPairsB.sign.publicKey,
    prevEvent: removeShareDocumentDeviceEvent,
  });
  expect(() =>
    resolveState({
      events: [
        event,
        addShareDocumentDeviceEvent,
        removeShareDocumentDeviceEvent,
        removeShareDocumentDeviceEvent2,
      ],
      knownVersion: 0,
    })
  ).toThrow(InvalidDocumentChainError);
});

test("should fail if a device is removed that doesn't exist", async () => {
  const event = createDocumentChain({
    authorKeyPair: keyPairsA.sign,
  });
  const addShareDocumentDeviceEvent = addShareDocumentDevice({
    authorKeyPair: keyPairsA.sign,
    signingPublicKey: keyPairsB.sign.publicKey,
    encryptionPublicKey: keyPairsB.encryption.publicKey,
    role: "EDITOR",
    prevEvent: event,
  });
  const removeShareDocumentDeviceEvent = removeShareDocumentDevice({
    authorKeyPair: keyPairsA.sign,
    signingPublicKey: "abc",
    prevEvent: addShareDocumentDeviceEvent,
  });
  expect(() =>
    resolveState({
      events: [
        event,
        addShareDocumentDeviceEvent,
        removeShareDocumentDeviceEvent,
      ],
      knownVersion: 0,
    })
  ).toThrow(InvalidDocumentChainError);
});

// ---------------------------

test("should fail if the signature has been manipulated", async () => {
  const event = createDocumentChain({
    authorKeyPair: keyPairsA.sign,
  });
  const addShareDocumentDeviceEvent = addShareDocumentDevice({
    authorKeyPair: keyPairsA.sign,
    signingPublicKey: keyPairsB.sign.publicKey,
    encryptionPublicKey: keyPairsB.encryption.publicKey,
    role: "EDITOR",
    prevEvent: event,
  });
  const removeShareDocumentDeviceEvent = removeShareDocumentDevice({
    authorKeyPair: keyPairsA.sign,
    signingPublicKey: "abc",
    prevEvent: addShareDocumentDeviceEvent,
  });

  addShareDocumentDeviceEvent.author.signature = sodium.to_base64(
    sodium.crypto_sign_detached(
      "something",
      sodium.from_base64(keyPairsA.sign.privateKey)
    )
  );

  expect(() =>
    resolveState({
      events: [
        event,
        addShareDocumentDeviceEvent,
        removeShareDocumentDeviceEvent,
      ],
      knownVersion: 0,
    })
  ).toThrow(InvalidDocumentChainError);
});

test("should fail if the author (publicKey and signature) have been replaced", async () => {
  const event = createDocumentChain({
    authorKeyPair: keyPairsA.sign,
  });
  const addShareDocumentDeviceEvent = addShareDocumentDevice({
    authorKeyPair: keyPairsA.sign,
    signingPublicKey: keyPairsB.sign.publicKey,
    encryptionPublicKey: keyPairsB.encryption.publicKey,
    role: "EDITOR",
    prevEvent: event,
  });
  const removeShareDocumentDeviceEvent = removeShareDocumentDevice({
    authorKeyPair: keyPairsA.sign,
    signingPublicKey: "abc",
    prevEvent: addShareDocumentDeviceEvent,
  });

  addShareDocumentDeviceEvent.author = {
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
      events: [
        event,
        addShareDocumentDeviceEvent,
        removeShareDocumentDeviceEvent,
      ],
      knownVersion: 0,
    })
  ).toThrow(InvalidDocumentChainError);
});

test("should fail if the chain is based on a different event", async () => {
  const event = createDocumentChain({
    authorKeyPair: keyPairsA.sign,
  });
  const addShareDocumentDeviceEvent = addShareDocumentDevice({
    authorKeyPair: keyPairsA.sign,
    signingPublicKey: keyPairsB.sign.publicKey,
    encryptionPublicKey: keyPairsB.encryption.publicKey,
    role: "EDITOR",
    prevEvent: event,
  });
  const addShareDocumentDeviceEvent2 = addShareDocumentDevice({
    authorKeyPair: keyPairsA.sign,
    signingPublicKey: keyPairsB.sign.publicKey,
    encryptionPublicKey: keyPairsB.encryption.publicKey,
    role: "EDITOR",
    prevEvent: event,
  });
  const removeShareDocumentDeviceEvent = removeShareDocumentDevice({
    authorKeyPair: keyPairsA.sign,
    signingPublicKey: "abc",
    prevEvent: addShareDocumentDeviceEvent2,
  });

  expect(() =>
    resolveState({
      events: [
        event,
        addShareDocumentDeviceEvent,
        removeShareDocumentDeviceEvent,
      ],
      knownVersion: 0,
    })
  ).toThrow(InvalidDocumentChainError);
});
