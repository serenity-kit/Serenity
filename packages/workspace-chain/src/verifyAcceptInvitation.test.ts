import sodium from "libsodium-wrappers";
import {
  getDateIn2Min,
  getKeyPairA,
  getKeyPairB,
  getKeyPairsA,
  getKeyPairsB,
  KeyPairs,
} from "../test/testUtils";
import { acceptInvitation } from "./acceptInvitation";
import { addInvitation, createChain } from "./index";
import { hashTransaction } from "./utils";
import { verifyAcceptInvitation } from "./verifyAcceptInvitation";

let keyPairA: sodium.KeyPair;
let keyPairsA: KeyPairs;
let keyPairB: sodium.KeyPair;
let keyPairsB: KeyPairs;

beforeAll(async () => {
  await sodium.ready;
  keyPairA = getKeyPairA();
  keyPairsA = getKeyPairsA();
  keyPairB = getKeyPairB();
  keyPairsB = getKeyPairsB();
});

test("should be able to verify a accepted invitation", async () => {
  const mainDevice = {
    mainDeviceEncryptionPublicKey: keyPairsB.box.publicKey,
    mainDeviceSigningPublicKey: keyPairsB.sign.publicKey,
    mainDeviceEncryptionPublicKeySignature: sodium.to_base64(
      sodium.crypto_sign_detached(
        keyPairsB.box.publicKey,
        sodium.from_base64(keyPairsB.sign.privateKey)
      )
    ),
  };

  const createEvent = createChain(keyPairsA.sign, {
    [keyPairsA.sign.publicKey]: keyPairsA.box.publicKey,
  });
  const addInvitationEvent = addInvitation({
    prevHash: hashTransaction(createEvent.transaction),
    authorKeyPair: keyPairA,
    expiresAt: getDateIn2Min(),
    role: "EDITOR",
    workspaceId: "test",
  });

  if (addInvitationEvent.transaction.type !== "add-invitation") {
    throw new Error("Invalid transaction type");
  }

  const acceptInvitationSignature = acceptInvitation({
    invitationSigningKeyPairSeed:
      addInvitationEvent.invitationSigningKeyPairSeed,
    invitationId: addInvitationEvent.transaction.invitationId,
    role: addInvitationEvent.transaction.role,
    workspaceId: addInvitationEvent.transaction.workspaceId,
    expiresAt: new Date(addInvitationEvent.transaction.expiresAt),
    invitationDataSignature:
      addInvitationEvent.transaction.invitationDataSignature,
    invitationSigningPublicKey:
      addInvitationEvent.transaction.invitationSigningPublicKey,
    ...mainDevice,
  });

  const result = verifyAcceptInvitation({
    acceptInvitationSignature: sodium.to_base64(acceptInvitationSignature),
    ...mainDevice,
    ...addInvitationEvent.transaction,
    expiresAt: new Date(addInvitationEvent.transaction.expiresAt),
  });

  expect(result).toBe(true);
});
