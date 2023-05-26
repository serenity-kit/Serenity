import sodium from "react-native-libsodium";
import {
  getDate2MinAgo,
  getDateIn2Min,
  getKeyPairA,
  getKeyPairB,
  getKeyPairsA,
  getKeyPairsB,
  KeyPairs,
} from "../test/testUtils";
import { acceptInvitation } from "./acceptInvitation";
import {
  addInvitation,
  AddInvitationResult,
  createChain,
  CreateChainTrustChainEvent,
} from "./index";
import { hashTransaction } from "./utils";

let keyPairA: sodium.KeyPair;
let keyPairsA: KeyPairs;
let keyPairB: sodium.KeyPair;
let keyPairsB: KeyPairs;
let createEvent: CreateChainTrustChainEvent;
let addInvitationEvent: AddInvitationResult;
let mainDevice: {
  mainDeviceSigningPublicKey: string;
};

beforeAll(async () => {
  await sodium.ready;
  keyPairA = getKeyPairA();
  keyPairsA = getKeyPairsA();
  keyPairB = getKeyPairB();
  keyPairsB = getKeyPairsB();
  createEvent = createChain(keyPairsA.sign);
  addInvitationEvent = addInvitation({
    prevHash: hashTransaction(createEvent.transaction),
    authorKeyPair: keyPairA,
    expiresAt: getDateIn2Min(),
    role: "EDITOR",
    workspaceId: "test",
  });
  mainDevice = {
    mainDeviceSigningPublicKey: keyPairsB.sign.publicKey,
  };
});

test("should be able to accept an invitation", async () => {
  if (addInvitationEvent.transaction.type !== "add-invitation") {
    throw new Error("Invalid transaction type");
  }

  const acceptInvitationSignature = acceptInvitation({
    invitationSigningKeyPairSeed:
      addInvitationEvent.invitationSigningKeyPairSeed,
    ...addInvitationEvent.transaction,
    ...mainDevice,
    expiresAt: new Date(addInvitationEvent.transaction.expiresAt),
  });

  expect(acceptInvitationSignature).toBeInstanceOf(Uint8Array);
});

test("should throw an error if the invitationSigningPublicKey has been replaced", async () => {
  expect(() => {
    if (addInvitationEvent.transaction.type !== "add-invitation") {
      return;
    }
    acceptInvitation({
      invitationSigningKeyPairSeed:
        addInvitationEvent.invitationSigningKeyPairSeed,
      ...addInvitationEvent.transaction,
      ...mainDevice,
      expiresAt: new Date(addInvitationEvent.transaction.expiresAt),
      invitationSigningPublicKey: keyPairsA.sign.publicKey,
    });
  }).toThrow("Invitation signing public key doesn't match the seed");
});

test("should throw an error if the workspaceId has been replaced", async () => {
  expect(() => {
    if (addInvitationEvent.transaction.type !== "add-invitation") {
      return;
    }
    acceptInvitation({
      invitationSigningKeyPairSeed:
        addInvitationEvent.invitationSigningKeyPairSeed,
      ...addInvitationEvent.transaction,
      ...mainDevice,
      expiresAt: new Date(addInvitationEvent.transaction.expiresAt),
      workspaceId: "wrong",
    });
  }).toThrow("Invitation data signature is invalid");
});

test("should throw an error if the invitationId has been replaced", async () => {
  expect(() => {
    if (addInvitationEvent.transaction.type !== "add-invitation") {
      return;
    }
    acceptInvitation({
      invitationSigningKeyPairSeed:
        addInvitationEvent.invitationSigningKeyPairSeed,
      ...addInvitationEvent.transaction,
      ...mainDevice,
      expiresAt: new Date(addInvitationEvent.transaction.expiresAt),
      invitationId: "wrong",
    });
  }).toThrow("Invitation data signature is invalid");
});

test("should throw an error if the invitationId has been replaced", async () => {
  expect(() => {
    if (addInvitationEvent.transaction.type !== "add-invitation") {
      return;
    }
    acceptInvitation({
      invitationSigningKeyPairSeed:
        addInvitationEvent.invitationSigningKeyPairSeed,
      ...addInvitationEvent.transaction,
      ...mainDevice,
      expiresAt: new Date(addInvitationEvent.transaction.expiresAt),
      role: "ADMIN",
    });
  }).toThrow("Invitation data signature is invalid");
});

test("should throw an error if the expiredAt has been replaced", async () => {
  expect(() => {
    if (addInvitationEvent.transaction.type !== "add-invitation") {
      return;
    }
    acceptInvitation({
      invitationSigningKeyPairSeed:
        addInvitationEvent.invitationSigningKeyPairSeed,
      ...addInvitationEvent.transaction,
      ...mainDevice,
      expiresAt: getDate2MinAgo(),
    });
  }).toThrow("Invitation data signature is invalid");
});

test("should throw an error if the invitation is expired", async () => {
  const addInvitationEvent = addInvitation({
    prevHash: hashTransaction(createEvent.transaction),
    authorKeyPair: keyPairA,
    expiresAt: getDate2MinAgo(),
    role: "EDITOR",
    workspaceId: "test",
  });

  expect(() => {
    if (addInvitationEvent.transaction.type !== "add-invitation") {
      return;
    }

    acceptInvitation({
      invitationSigningKeyPairSeed:
        addInvitationEvent.invitationSigningKeyPairSeed,
      ...addInvitationEvent.transaction,
      ...mainDevice,
      expiresAt: new Date(addInvitationEvent.transaction.expiresAt),
    });
  }).toThrow("Invitation has expired");
});
