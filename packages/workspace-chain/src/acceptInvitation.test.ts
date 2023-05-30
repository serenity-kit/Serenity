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
    workspaceId: "test",
  });
});

test("should be able to accept an invitation", async () => {
  if (addInvitationEvent.transaction.type !== "add-invitation") {
    throw new Error("Invalid transaction type");
  }

  const { acceptInvitationSignature, acceptInvitationAuthorSignature } =
    acceptInvitation({
      invitationSigningKeyPairSeed:
        addInvitationEvent.invitationSigningKeyPairSeed,
      ...addInvitationEvent.transaction,
      expiresAt: new Date(addInvitationEvent.transaction.expiresAt),
      authorKeyPair: keyPairB,
    });

  expect(acceptInvitationSignature).toBeInstanceOf(Uint8Array);
  expect(acceptInvitationAuthorSignature).toBeInstanceOf(Uint8Array);
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
      expiresAt: new Date(addInvitationEvent.transaction.expiresAt),
      invitationSigningPublicKey: keyPairsA.sign.publicKey,
      authorKeyPair: keyPairB,
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
      expiresAt: new Date(addInvitationEvent.transaction.expiresAt),
      workspaceId: "wrong",
      authorKeyPair: keyPairB,
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
      expiresAt: new Date(addInvitationEvent.transaction.expiresAt),
      invitationId: "wrong",
      authorKeyPair: keyPairB,
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
      expiresAt: new Date(addInvitationEvent.transaction.expiresAt),
      role: "ADMIN",
      authorKeyPair: keyPairB,
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
      expiresAt: getDate2MinAgo(),
      authorKeyPair: keyPairB,
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
      expiresAt: new Date(addInvitationEvent.transaction.expiresAt),
      authorKeyPair: keyPairB,
    });
  }).toThrow("Invitation has expired");
});
