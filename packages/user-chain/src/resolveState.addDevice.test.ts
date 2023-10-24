import { generateId } from "@serenity-tools/common";
import canonicalize from "canonicalize";
import sodium from "react-native-libsodium";
import { KeyPairs, getKeyPairsA, getKeyPairsB } from "../test/testUtils";
import {
  userDeviceEncryptionPublicKeyDomainContext,
  userDeviceSigningKeyProofDomainContext,
} from "./constants";
import {
  AddDeviceEvent,
  AddDeviceTransaction,
  CreateUserChainEvent,
  CreateUserChainTransaction,
  InvalidUserChainError,
  UnknownVersionUserChainError,
  addDevice,
  createUserChain,
  hashEvent,
  hashTransaction,
  resolveState,
} from "./index";

let keyPairsA: KeyPairs;
let keyPairsB: KeyPairs;

beforeAll(async () => {
  await sodium.ready;
  keyPairsA = getKeyPairsA();
  keyPairsB = getKeyPairsB();
});

test("should resolve to two devices after adding a device", async () => {
  const event = createUserChain({
    authorKeyPair: keyPairsA.sign,
    encryptionPublicKey: keyPairsA.encryption.publicKey,
    email: "jane@example.com",
  });
  const addDeviceEvent = addDevice({
    authorKeyPair: keyPairsA.sign,
    signingPrivateKey: keyPairsB.sign.privateKey,
    signingPublicKey: keyPairsB.sign.publicKey,
    encryptionPublicKey: keyPairsB.encryption.publicKey,
    prevEvent: event,
  });
  const state = resolveState({
    events: [event, addDeviceEvent],
    knownVersion: 0,
  });
  expect(state.currentState.devices).toMatchInlineSnapshot(`
    {
      "74IPzs2dhoERLRuxeS7zadzEvKfb7IqOK-jKu0mQxIM": {
        "encryptionPublicKey": "wevxDsZ-L7wpy3ePZcQNfG8WDh0wB0d27phr5OMdLwI",
        "expiresAt": undefined,
      },
      "MTDhqVIMflTD0Car-KSP1MWCIEYqs2LBaXfU20di0tY": {
        "encryptionPublicKey": "b_skeL8qudNQji-HuOldPNFDzYSBENNqmFMlawhtrHg",
        "expiresAt": undefined,
      },
    }
  `);
  expect(state.currentState.removedDevices).toMatchInlineSnapshot(`{}`);
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
  const event = createUserChain({
    authorKeyPair: keyPairsA.sign,
    encryptionPublicKey: keyPairsA.encryption.publicKey,
    email: "jane@example.com",
  });
  const addDeviceEvent = addDevice({
    authorKeyPair: keyPairsA.sign,
    signingPrivateKey: keyPairsB.sign.privateKey,
    signingPublicKey: keyPairsB.sign.publicKey,
    encryptionPublicKey: keyPairsB.encryption.publicKey,
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
        "encryptionPublicKey": "wevxDsZ-L7wpy3ePZcQNfG8WDh0wB0d27phr5OMdLwI",
        "expiresAt": undefined,
      },
      "MTDhqVIMflTD0Car-KSP1MWCIEYqs2LBaXfU20di0tY": {
        "encryptionPublicKey": "b_skeL8qudNQji-HuOldPNFDzYSBENNqmFMlawhtrHg",
        "expiresAt": "2030-01-01T00:00:00.000Z",
      },
    }
  `);
  expect(state.currentState.removedDevices).toMatchInlineSnapshot(`{}`);
});

test("should fail if an invalid expireAt is provided", async () => {
  const event = createUserChain({
    authorKeyPair: keyPairsA.sign,
    encryptionPublicKey: keyPairsA.encryption.publicKey,
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
  const event = createUserChain({
    authorKeyPair: keyPairsA.sign,
    encryptionPublicKey: keyPairsA.encryption.publicKey,
    email: "jane@example.com",
  });
  const addDeviceEvent = addDevice({
    authorKeyPair: keyPairsA.sign,
    signingPrivateKey: keyPairsB.sign.privateKey,
    signingPublicKey: keyPairsB.sign.publicKey,
    encryptionPublicKey: keyPairsB.encryption.publicKey,
    prevEvent: event,
  });
  const addDeviceEvent2 = addDevice({
    authorKeyPair: keyPairsA.sign,
    signingPrivateKey: keyPairsB.sign.privateKey,
    signingPublicKey: keyPairsB.sign.publicKey,
    encryptionPublicKey: keyPairsB.encryption.publicKey,
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
  const event = createUserChain({
    authorKeyPair: keyPairsA.sign,
    encryptionPublicKey: keyPairsA.encryption.publicKey,
    email: "jane@example.com",
  });
  const addDeviceEvent = addDevice({
    authorKeyPair: keyPairsA.sign,
    signingPrivateKey: keyPairsB.sign.privateKey,
    signingPublicKey: keyPairsB.sign.publicKey,
    encryptionPublicKey: keyPairsB.encryption.publicKey,
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
  const event = createUserChain({
    authorKeyPair: keyPairsA.sign,
    encryptionPublicKey: keyPairsA.encryption.publicKey,
    email: "jane@example.com",
  });
  const addDeviceEvent = addDevice({
    authorKeyPair: keyPairsA.sign,
    signingPrivateKey: keyPairsB.sign.privateKey,
    signingPublicKey: keyPairsB.sign.publicKey,
    encryptionPublicKey: keyPairsB.encryption.publicKey,
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

test("should fail if the encryptionPublicKeySignature have been manipulated", async () => {
  const event = createUserChain({
    authorKeyPair: keyPairsA.sign,
    encryptionPublicKey: keyPairsA.encryption.publicKey,
    email: "jane@example.com",
  });
  const addDeviceEvent = addDevice({
    authorKeyPair: keyPairsA.sign,
    signingPrivateKey: keyPairsB.sign.privateKey,
    signingPublicKey: keyPairsB.sign.publicKey,
    encryptionPublicKey: keyPairsB.encryption.publicKey,
    prevEvent: event,
  });

  addDeviceEvent.transaction.encryptionPublicKeySignature = sodium.to_base64(
    sodium.crypto_sign_detached(
      userDeviceEncryptionPublicKeyDomainContext + "something",
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

test("should fail if the knownVersion is smaller than the actual event version", async () => {
  const event = createUserChain({
    authorKeyPair: keyPairsA.sign,
    encryptionPublicKey: keyPairsA.encryption.publicKey,
    email: "jane@example.com",
  });

  const addDeviceWithVersion1 = ({
    authorKeyPair,
    prevEvent,
    signingPrivateKey,
    signingPublicKey,
    encryptionPublicKey,
  }): AddDeviceEvent => {
    const prevEventHash = hashEvent(prevEvent);
    const encryptionPublicKeySignature = sodium.crypto_sign_detached(
      userDeviceEncryptionPublicKeyDomainContext +
        sodium.from_base64(encryptionPublicKey),
      sodium.from_base64(signingPrivateKey)
    );

    const deviceSigningContent = canonicalize({
      userDeviceSigningKeyProofDomainContext,
      prevEventHash,
    });
    if (!deviceSigningContent) {
      throw new Error("Failed to canonicalize device signing content");
    }

    const deviceSigningKeyProof = sodium.crypto_sign_detached(
      deviceSigningContent,
      sodium.from_base64(signingPrivateKey)
    );

    const transaction: AddDeviceTransaction = {
      type: "add-device",
      signingPublicKey,
      deviceSigningKeyProof: sodium.to_base64(deviceSigningKeyProof),
      encryptionPublicKey,
      encryptionPublicKeySignature: sodium.to_base64(
        encryptionPublicKeySignature
      ),
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
    signingPrivateKey: keyPairsB.sign.privateKey,
    signingPublicKey: keyPairsB.sign.publicKey,
    encryptionPublicKey: keyPairsB.encryption.publicKey,
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
  const createUserChainWithVersion1 = ({
    authorKeyPair,
    email,
    encryptionPublicKey,
  }): CreateUserChainEvent => {
    const encryptionPublicKeySignature = sodium.crypto_sign_detached(
      userDeviceEncryptionPublicKeyDomainContext + encryptionPublicKey,
      sodium.from_base64(authorKeyPair.privateKey)
    );
    const transaction: CreateUserChainTransaction = {
      type: "create",
      id: generateId(),
      prevEventHash: null,
      email,
      version: 1,
      encryptionPublicKey,
      encryptionPublicKeySignature: sodium.to_base64(
        encryptionPublicKeySignature
      ),
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

  const event = createUserChainWithVersion1({
    authorKeyPair: keyPairsA.sign,
    email: "jane@example.com",
    encryptionPublicKey: keyPairsA.encryption.publicKey,
  });
  const addDeviceEvent = addDevice({
    authorKeyPair: keyPairsA.sign,
    signingPrivateKey: keyPairsB.sign.privateKey,
    signingPublicKey: keyPairsB.sign.publicKey,
    encryptionPublicKey: keyPairsB.encryption.publicKey,
    prevEvent: event,
  });
  expect(() =>
    resolveState({ events: [event, addDeviceEvent], knownVersion: 1 })
  ).toThrow(InvalidUserChainError);
});

test("should fail if the chain is based on a different event", async () => {
  const event = createUserChain({
    authorKeyPair: keyPairsA.sign,
    encryptionPublicKey: keyPairsA.encryption.publicKey,
    email: "jane@example.com",
  });
  const event2 = createUserChain({
    authorKeyPair: keyPairsA.sign,
    encryptionPublicKey: keyPairsA.encryption.publicKey,
    email: "jane@example.com",
  });
  const addDeviceEvent = addDevice({
    authorKeyPair: keyPairsA.sign,
    signingPrivateKey: keyPairsB.sign.privateKey,
    signingPublicKey: keyPairsB.sign.publicKey,
    encryptionPublicKey: keyPairsB.encryption.publicKey,
    prevEvent: event2,
  });

  expect(() =>
    resolveState({
      events: [event, addDeviceEvent],
      knownVersion: 0,
    })
  ).toThrow(InvalidUserChainError);
});
