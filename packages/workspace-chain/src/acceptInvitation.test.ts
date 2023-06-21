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
  CreateChainWorkspaceChainEvent,
} from "./index";
import { hashTransaction } from "./utils";

let keyPairA: sodium.KeyPair;
let keyPairsA: KeyPairs;
let keyPairB: sodium.KeyPair;
let keyPairsB: KeyPairs;
let createEvent: CreateChainWorkspaceChainEvent;
let addInvitationEvent: AddInvitationResult;

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
    workspaceId: createEvent.transaction.id,
  });
});

test("should be able to accept an invitation", async () => {
  if (addInvitationEvent.transaction.type !== "add-invitation") {
    throw new Error("Invalid transaction type");
  }

  const event = acceptInvitation({
    ...addInvitationEvent.transaction,
    prevHash: hashTransaction(addInvitationEvent.transaction),
    invitationSigningKeyPairSeed:
      addInvitationEvent.invitationSigningKeyPairSeed,
    expiresAt: new Date(addInvitationEvent.transaction.expiresAt),
    authorKeyPair: keyPairB,
  });

  expect(event.authors[0].publicKey).toBe(sodium.to_base64(keyPairB.publicKey));
  expect(event.transaction.invitationId).toBeDefined();
});

test("should throw an error if the invitationSigningPublicKey has been replaced", async () => {
  expect(() => {
    if (addInvitationEvent.transaction.type !== "add-invitation") {
      return;
    }
    acceptInvitation({
      ...addInvitationEvent.transaction,
      prevHash: hashTransaction(addInvitationEvent.transaction),
      invitationSigningKeyPairSeed:
        addInvitationEvent.invitationSigningKeyPairSeed,
      expiresAt: new Date(addInvitationEvent.transaction.expiresAt),
      authorKeyPair: keyPairB,
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
      ...addInvitationEvent.transaction,
      prevHash: hashTransaction(addInvitationEvent.transaction),
      invitationSigningKeyPairSeed:
        addInvitationEvent.invitationSigningKeyPairSeed,
      expiresAt: new Date(addInvitationEvent.transaction.expiresAt),
      authorKeyPair: keyPairB,
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
      ...addInvitationEvent.transaction,
      prevHash: hashTransaction(addInvitationEvent.transaction),
      invitationSigningKeyPairSeed:
        addInvitationEvent.invitationSigningKeyPairSeed,
      expiresAt: new Date(addInvitationEvent.transaction.expiresAt),
      authorKeyPair: keyPairB,
      invitationId: "wrong",
    });
  }).toThrow("Invitation data signature is invalid");
});

test("should throw an error if the role has been replaced", async () => {
  expect(() => {
    if (addInvitationEvent.transaction.type !== "add-invitation") {
      return;
    }
    acceptInvitation({
      ...addInvitationEvent.transaction,
      prevHash: hashTransaction(addInvitationEvent.transaction),
      invitationSigningKeyPairSeed:
        addInvitationEvent.invitationSigningKeyPairSeed,
      expiresAt: new Date(addInvitationEvent.transaction.expiresAt),
      authorKeyPair: keyPairB,
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
      ...addInvitationEvent.transaction,
      prevHash: hashTransaction(addInvitationEvent.transaction),
      invitationSigningKeyPairSeed:
        addInvitationEvent.invitationSigningKeyPairSeed,
      authorKeyPair: keyPairB,
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
    workspaceId: createEvent.transaction.id,
  });

  expect(() => {
    if (addInvitationEvent.transaction.type !== "add-invitation") {
      return;
    }

    acceptInvitation({
      ...addInvitationEvent.transaction,
      prevHash: hashTransaction(addInvitationEvent.transaction),
      invitationSigningKeyPairSeed:
        addInvitationEvent.invitationSigningKeyPairSeed,
      authorKeyPair: keyPairB,
      expiresAt: new Date(addInvitationEvent.transaction.expiresAt),
    });
  }).toThrow("Invitation has expired");
});
