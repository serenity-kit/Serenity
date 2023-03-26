import sodium from "react-native-libsodium";
import {
  getDateIn2Min,
  getKeyPairA,
  getKeyPairB,
  getKeyPairsA,
  getKeyPairsB,
  KeyPairs,
} from "../test/testUtils";
import { acceptInvitation } from "./acceptInvitation";
import { addInvitation, AddInvitationResult, createChain } from "./index";
import { hashTransaction } from "./utils";
import { verifyAcceptInvitation } from "./verifyAcceptInvitation";

let keyPairA: sodium.KeyPair;
let keyPairsA: KeyPairs;
let keyPairB: sodium.KeyPair;
let keyPairsB: KeyPairs;
let addInvitationEvent: AddInvitationResult;
let acceptInvitationSignature: Uint8Array;
let mainDevice: {
  mainDeviceEncryptionPublicKey: string;
  mainDeviceSigningPublicKey: string;
  mainDeviceEncryptionPublicKeySignature: string;
};

beforeAll(async () => {
  await sodium.ready;
  keyPairA = getKeyPairA();
  keyPairsA = getKeyPairsA();
  keyPairB = getKeyPairB();
  keyPairsB = getKeyPairsB();
  const createEvent = createChain(keyPairsA.sign, {
    [keyPairsA.sign.publicKey]: keyPairsA.box.publicKey,
  });
  addInvitationEvent = addInvitation({
    prevHash: hashTransaction(createEvent.transaction),
    authorKeyPair: keyPairA,
    expiresAt: getDateIn2Min(),
    role: "EDITOR",
    workspaceId: "test",
  });
  mainDevice = {
    mainDeviceEncryptionPublicKey: keyPairsB.box.publicKey,
    mainDeviceSigningPublicKey: keyPairsB.sign.publicKey,
    mainDeviceEncryptionPublicKeySignature: sodium.to_base64(
      sodium.crypto_sign_detached(
        keyPairsB.box.publicKey,
        sodium.from_base64(keyPairsB.sign.privateKey)
      )
    ),
  };
  if (addInvitationEvent.transaction.type !== "add-invitation") {
    throw new Error("Invalid transaction type");
  }

  acceptInvitationSignature = acceptInvitation({
    invitationSigningKeyPairSeed:
      addInvitationEvent.invitationSigningKeyPairSeed,
    ...addInvitationEvent.transaction,
    ...mainDevice,
    expiresAt: new Date(addInvitationEvent.transaction.expiresAt),
  });
});

test("should be able to verify a accepted invitation", async () => {
  if (addInvitationEvent.transaction.type !== "add-invitation") {
    throw new Error("Invalid transaction type");
  }
  const result = verifyAcceptInvitation({
    acceptInvitationSignature: sodium.to_base64(acceptInvitationSignature),
    ...mainDevice,
    ...addInvitationEvent.transaction,
    expiresAt: new Date(addInvitationEvent.transaction.expiresAt),
  });

  expect(result).toBe(true);
});

test("should fail to verify if acceptInvitationSignature has been modified", async () => {
  if (addInvitationEvent.transaction.type !== "add-invitation") {
    throw new Error("Invalid transaction type");
  }
  const result = verifyAcceptInvitation({
    acceptInvitationSignature:
      "b" + sodium.to_base64(acceptInvitationSignature).substring(1),
    ...mainDevice,
    ...addInvitationEvent.transaction,
    expiresAt: new Date(addInvitationEvent.transaction.expiresAt),
  });

  expect(result).toBe(false);
});

test("should fail to verify if mainDeviceEncryptionPublicKey has been modified", async () => {
  if (addInvitationEvent.transaction.type !== "add-invitation") {
    throw new Error("Invalid transaction type");
  }
  const result = verifyAcceptInvitation({
    acceptInvitationSignature: sodium.to_base64(acceptInvitationSignature),
    ...mainDevice,
    ...addInvitationEvent.transaction,
    expiresAt: new Date(addInvitationEvent.transaction.expiresAt),
    mainDeviceEncryptionPublicKey:
      "c" + mainDevice.mainDeviceEncryptionPublicKey.substring(1),
  });

  expect(result).toBe(false);
});

test("should fail to verify if mainDeviceSigningPublicKey has been modified", async () => {
  if (addInvitationEvent.transaction.type !== "add-invitation") {
    throw new Error("Invalid transaction type");
  }
  const result = verifyAcceptInvitation({
    acceptInvitationSignature: sodium.to_base64(acceptInvitationSignature),
    ...mainDevice,
    ...addInvitationEvent.transaction,
    expiresAt: new Date(addInvitationEvent.transaction.expiresAt),
    mainDeviceSigningPublicKey:
      "b" + mainDevice.mainDeviceSigningPublicKey.substring(1),
  });

  expect(result).toBe(false);
});

test("should fail to verify if mainDeviceEncryptionPublicKeySignature has been modified", async () => {
  if (addInvitationEvent.transaction.type !== "add-invitation") {
    throw new Error("Invalid transaction type");
  }
  const result = verifyAcceptInvitation({
    acceptInvitationSignature: sodium.to_base64(acceptInvitationSignature),
    ...mainDevice,
    ...addInvitationEvent.transaction,
    expiresAt: new Date(addInvitationEvent.transaction.expiresAt),
    mainDeviceEncryptionPublicKeySignature:
      "b" + mainDevice.mainDeviceEncryptionPublicKeySignature.substring(1),
  });

  expect(result).toBe(false);
});

test("should fail to verify if expiresAt has been modified", async () => {
  if (addInvitationEvent.transaction.type !== "add-invitation") {
    throw new Error("Invalid transaction type");
  }
  const result = verifyAcceptInvitation({
    acceptInvitationSignature: sodium.to_base64(acceptInvitationSignature),
    ...mainDevice,
    ...addInvitationEvent.transaction,
    expiresAt: getDateIn2Min(),
  });

  expect(result).toBe(false);
});

test("should fail to verify if role has been modified", async () => {
  if (addInvitationEvent.transaction.type !== "add-invitation") {
    throw new Error("Invalid transaction type");
  }
  const result = verifyAcceptInvitation({
    acceptInvitationSignature: sodium.to_base64(acceptInvitationSignature),
    ...mainDevice,
    ...addInvitationEvent.transaction,
    expiresAt: new Date(addInvitationEvent.transaction.expiresAt),
    role: "ADMIN",
  });

  expect(result).toBe(false);
});

test("should fail to verify if workspaceId has been modified", async () => {
  if (addInvitationEvent.transaction.type !== "add-invitation") {
    throw new Error("Invalid transaction type");
  }
  const result = verifyAcceptInvitation({
    acceptInvitationSignature: sodium.to_base64(acceptInvitationSignature),
    ...mainDevice,
    ...addInvitationEvent.transaction,
    expiresAt: new Date(addInvitationEvent.transaction.expiresAt),
    workspaceId: "wrong",
  });

  expect(result).toBe(false);
});

test("should fail to verify if invitationId has been modified", async () => {
  if (addInvitationEvent.transaction.type !== "add-invitation") {
    throw new Error("Invalid transaction type");
  }
  const result = verifyAcceptInvitation({
    acceptInvitationSignature: sodium.to_base64(acceptInvitationSignature),
    ...mainDevice,
    ...addInvitationEvent.transaction,
    expiresAt: new Date(addInvitationEvent.transaction.expiresAt),
    invitationId: "wrong",
  });

  expect(result).toBe(false);
});
