import sodium from "react-native-libsodium";
import { getKeyPairsA, getKeyPairsB, KeyPairs } from "../test/testUtils";
import {
  addShareDevice,
  createChain,
  InvalidDocumentChainError,
  removeDevice,
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
  const event = createChain({
    authorKeyPair: keyPairsA.sign,
  });
  const addShareDeviceEvent = addShareDevice({
    authorKeyPair: keyPairsA.sign,
    signingPublicKey: keyPairsB.sign.publicKey,
    encryptionPublicKey: keyPairsB.encryption.publicKey,
    role: "EDITOR",
    prevEvent: event,
  });
  const removeDeviceEvent = removeDevice({
    authorKeyPair: keyPairsA.sign,
    signingPublicKey: keyPairsB.sign.publicKey,
    prevEvent: addShareDeviceEvent,
  });
  const state = resolveState({
    events: [event, addShareDeviceEvent, removeDeviceEvent],
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
  const event = createChain({
    authorKeyPair: keyPairsA.sign,
  });
  const addShareDeviceEvent = addShareDevice({
    authorKeyPair: keyPairsA.sign,
    signingPublicKey: keyPairsB.sign.publicKey,
    encryptionPublicKey: keyPairsB.encryption.publicKey,
    role: "EDITOR",
    prevEvent: event,
  });
  const removeDeviceEvent = removeDevice({
    authorKeyPair: keyPairsA.sign,
    signingPublicKey: keyPairsB.sign.publicKey,
    prevEvent: addShareDeviceEvent,
  });
  const removeDeviceEvent2 = removeDevice({
    authorKeyPair: keyPairsA.sign,
    signingPublicKey: keyPairsB.sign.publicKey,
    prevEvent: removeDeviceEvent,
  });
  expect(() =>
    resolveState({
      events: [
        event,
        addShareDeviceEvent,
        removeDeviceEvent,
        removeDeviceEvent2,
      ],
      knownVersion: 0,
    })
  ).toThrow(InvalidDocumentChainError);
});

test("should fail if a device is removed that doesn't exist", async () => {
  const event = createChain({
    authorKeyPair: keyPairsA.sign,
  });
  const addShareDeviceEvent = addShareDevice({
    authorKeyPair: keyPairsA.sign,
    signingPublicKey: keyPairsB.sign.publicKey,
    encryptionPublicKey: keyPairsB.encryption.publicKey,
    role: "EDITOR",
    prevEvent: event,
  });
  const removeDeviceEvent = removeDevice({
    authorKeyPair: keyPairsA.sign,
    signingPublicKey: "abc",
    prevEvent: addShareDeviceEvent,
  });
  expect(() =>
    resolveState({
      events: [event, addShareDeviceEvent, removeDeviceEvent],
      knownVersion: 0,
    })
  ).toThrow(InvalidDocumentChainError);
});

// ---------------------------

test("should fail if the signature has been manipulated", async () => {
  const event = createChain({
    authorKeyPair: keyPairsA.sign,
  });
  const addShareDeviceEvent = addShareDevice({
    authorKeyPair: keyPairsA.sign,
    signingPublicKey: keyPairsB.sign.publicKey,
    encryptionPublicKey: keyPairsB.encryption.publicKey,
    role: "EDITOR",
    prevEvent: event,
  });
  const removeDeviceEvent = removeDevice({
    authorKeyPair: keyPairsA.sign,
    signingPublicKey: "abc",
    prevEvent: addShareDeviceEvent,
  });

  addShareDeviceEvent.author.signature = sodium.to_base64(
    sodium.crypto_sign_detached(
      "something",
      sodium.from_base64(keyPairsA.sign.privateKey)
    )
  );

  expect(() =>
    resolveState({
      events: [event, addShareDeviceEvent, removeDeviceEvent],
      knownVersion: 0,
    })
  ).toThrow(InvalidDocumentChainError);
});

test("should fail if the author (publicKey and signature) have been replaced", async () => {
  const event = createChain({
    authorKeyPair: keyPairsA.sign,
  });
  const addShareDeviceEvent = addShareDevice({
    authorKeyPair: keyPairsA.sign,
    signingPublicKey: keyPairsB.sign.publicKey,
    encryptionPublicKey: keyPairsB.encryption.publicKey,
    role: "EDITOR",
    prevEvent: event,
  });
  const removeDeviceEvent = removeDevice({
    authorKeyPair: keyPairsA.sign,
    signingPublicKey: "abc",
    prevEvent: addShareDeviceEvent,
  });

  addShareDeviceEvent.author = {
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
      events: [event, addShareDeviceEvent, removeDeviceEvent],
      knownVersion: 0,
    })
  ).toThrow(InvalidDocumentChainError);
});

test("should fail if the chain is based on a different event", async () => {
  const event = createChain({
    authorKeyPair: keyPairsA.sign,
  });
  const addShareDeviceEvent = addShareDevice({
    authorKeyPair: keyPairsA.sign,
    signingPublicKey: keyPairsB.sign.publicKey,
    encryptionPublicKey: keyPairsB.encryption.publicKey,
    role: "EDITOR",
    prevEvent: event,
  });
  const addShareDeviceEvent2 = addShareDevice({
    authorKeyPair: keyPairsA.sign,
    signingPublicKey: keyPairsB.sign.publicKey,
    encryptionPublicKey: keyPairsB.encryption.publicKey,
    role: "EDITOR",
    prevEvent: event,
  });
  const removeDeviceEvent = removeDevice({
    authorKeyPair: keyPairsA.sign,
    signingPublicKey: "abc",
    prevEvent: addShareDeviceEvent2,
  });

  expect(() =>
    resolveState({
      events: [event, addShareDeviceEvent, removeDeviceEvent],
      knownVersion: 0,
    })
  ).toThrow(InvalidDocumentChainError);
});
