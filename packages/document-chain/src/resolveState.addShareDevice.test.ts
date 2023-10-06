import { generateId } from "@serenity-tools/common";
import sodium from "react-native-libsodium";
import { getKeyPairsA, getKeyPairsB, KeyPairs } from "../test/testUtils";
import {
  addShareDevice,
  AddShareDeviceEvent,
  AddShareDeviceTransaction,
  createChain,
  CreateChainEvent,
  CreateChainTransaction,
  deviceEncryptionPublicKeyDomainContext,
  hashEvent,
  hashTransaction,
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

test("should resolve to one share device after adding a device", async () => {
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
  const state = resolveState({
    events: [event, addShareDeviceEvent],
    knownVersion: 0,
  });
  expect(state.currentState.devices).toMatchInlineSnapshot(`
    {
      "MTDhqVIMflTD0Car-KSP1MWCIEYqs2LBaXfU20di0tY": {
        "encryptionPublicKey": "b_skeL8qudNQji-HuOldPNFDzYSBENNqmFMlawhtrHg",
        "expiresAt": undefined,
        "role": "EDITOR",
      },
    }
  `);
  expect(state.currentState.removedDevices).toMatchInlineSnapshot(`{}`);
  expect(state.statePerEvent[state.currentState.eventHash]).toEqual(
    state.currentState
  );
  expect(typeof state.currentState.id).toBe("string");
  expect(typeof state.currentState.eventHash).toBe("string");
  expect(state.currentState.eventVersion).toBe(0);
});

test("should resolve to have a device with an expireAt", async () => {
  const event = createChain({
    authorKeyPair: keyPairsA.sign,
  });
  const addShareDeviceEvent = addShareDevice({
    authorKeyPair: keyPairsA.sign,
    signingPublicKey: keyPairsB.sign.publicKey,
    encryptionPublicKey: keyPairsB.encryption.publicKey,
    role: "EDITOR",
    prevEvent: event,
    expiresAt: new Date("2030-01-01"),
  });
  const state = resolveState({
    events: [event, addShareDeviceEvent],
    knownVersion: 0,
  });
  expect(state.currentState.devices).toMatchInlineSnapshot(`
    {
      "MTDhqVIMflTD0Car-KSP1MWCIEYqs2LBaXfU20di0tY": {
        "encryptionPublicKey": "b_skeL8qudNQji-HuOldPNFDzYSBENNqmFMlawhtrHg",
        "expiresAt": "2030-01-01T00:00:00.000Z",
        "role": "EDITOR",
      },
    }
  `);
  expect(state.currentState.removedDevices).toMatchInlineSnapshot(`{}`);
});

test("should fail if an invalid expireAt is provided", async () => {
  const event = createChain({
    authorKeyPair: keyPairsA.sign,
  });
  expect(() =>
    addShareDevice({
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
    prevEvent: addShareDeviceEvent,
  });
  expect(() =>
    resolveState({
      events: [event, addShareDeviceEvent, addShareDeviceEvent2],
      knownVersion: 0,
    })
  ).toThrow(InvalidDocumentChainError);
});

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

  addShareDeviceEvent.author.signature = sodium.to_base64(
    sodium.crypto_sign_detached(
      "something",
      sodium.from_base64(keyPairsB.sign.privateKey)
    )
  );

  expect(() =>
    resolveState({
      events: [event, addShareDeviceEvent],
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
      events: [event, addShareDeviceEvent],
      knownVersion: 0,
    })
  ).toThrow(InvalidDocumentChainError);
});

test("should fail if the encryptionPublicKeySignature have been manipulated", async () => {
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

  addShareDeviceEvent.transaction.encryptionPublicKeySignature =
    sodium.to_base64(
      sodium.crypto_sign_detached(
        deviceEncryptionPublicKeyDomainContext + "something",
        sodium.from_base64(keyPairsB.sign.privateKey)
      )
    );

  expect(() =>
    resolveState({
      events: [event, addShareDeviceEvent],
      knownVersion: 0,
    })
  ).toThrow(InvalidDocumentChainError);
});

test("should fail if the knownVersion is smaller than the actual event version", async () => {
  const event = createChain({
    authorKeyPair: keyPairsA.sign,
  });

  const addShareDeviceWithVersion1 = ({
    authorKeyPair,
    prevEvent,
    signingPublicKey,
    encryptionPublicKey,
  }): AddShareDeviceEvent => {
    const prevEventHash = hashEvent(prevEvent);
    const encryptionPublicKeySignature = sodium.crypto_sign_detached(
      deviceEncryptionPublicKeyDomainContext +
        sodium.from_base64(encryptionPublicKey),
      sodium.from_base64(authorKeyPair.privateKey)
    );
    const transaction: AddShareDeviceTransaction = {
      type: "add-share-device",
      signingPublicKey,
      encryptionPublicKey,
      encryptionPublicKeySignature: sodium.to_base64(
        encryptionPublicKeySignature
      ),
      role: "EDITOR",
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

  const addShareDeviceEvent = addShareDeviceWithVersion1({
    authorKeyPair: keyPairsA.sign,
    signingPublicKey: keyPairsB.sign.publicKey,
    encryptionPublicKey: keyPairsB.encryption.publicKey,
    prevEvent: event,
  });

  expect(() =>
    resolveState({
      events: [event, addShareDeviceEvent],
      knownVersion: 0,
    })
  ).toThrow(UnknownVersionDocumentChainError);
});

test("should fail if an old event version is applied after a newer one", async () => {
  const createChainWithVersion1 = ({ authorKeyPair }): CreateChainEvent => {
    const transaction: CreateChainTransaction = {
      type: "create",
      id: generateId(),
      prevEventHash: null,
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
  });
  const addShareDeviceEvent = addShareDevice({
    authorKeyPair: keyPairsA.sign,
    signingPublicKey: keyPairsB.sign.publicKey,
    encryptionPublicKey: keyPairsB.encryption.publicKey,
    role: "EDITOR",
    prevEvent: event,
  });
  expect(() =>
    resolveState({ events: [event, addShareDeviceEvent], knownVersion: 1 })
  ).toThrow(InvalidDocumentChainError);
});

test("should fail if the chain is based on a different event", async () => {
  const event = createChain({
    authorKeyPair: keyPairsA.sign,
  });
  const event2 = createChain({
    authorKeyPair: keyPairsA.sign,
  });
  const addShareDeviceEvent = addShareDevice({
    authorKeyPair: keyPairsA.sign,
    signingPublicKey: keyPairsB.sign.publicKey,
    encryptionPublicKey: keyPairsB.encryption.publicKey,
    role: "EDITOR",
    prevEvent: event2,
  });

  expect(() =>
    resolveState({
      events: [event, addShareDeviceEvent],
      knownVersion: 0,
    })
  ).toThrow(InvalidDocumentChainError);
});
