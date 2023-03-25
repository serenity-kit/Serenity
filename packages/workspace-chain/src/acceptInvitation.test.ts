import sodium from "libsodium-wrappers";
import { acceptInvitation } from "./acceptInvitation";
import { addInvitation, createChain } from "./index";
import {
  getKeyPairA,
  getKeyPairB,
  getKeyPairsA,
  getKeyPairsB,
  KeyPairs,
} from "./testUtils";
import { hashTransaction } from "./utils";

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

test("should be able to accept an invitation", async () => {
  const createEvent = createChain(keyPairsA.sign, {
    [keyPairsA.sign.publicKey]: keyPairsA.box.publicKey,
  });
  const addInvitationEvent = addInvitation({
    prevHash: hashTransaction(createEvent.transaction),
    authorKeyPair: keyPairA,
    expiresAt: new Date(),
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
    mainDeviceEncryptionPublicKey: keyPairsB.box.publicKey,
    mainDeviceSigningPublicKey: keyPairsB.sign.publicKey,
    mainDeviceEncryptionPublicKeySignature: sodium.to_base64(
      sodium.crypto_sign_detached(
        keyPairsB.box.publicKey,
        sodium.from_base64(keyPairsA.sign.privateKey)
      )
    ),
  });

  expect(acceptInvitationSignature).toBeInstanceOf(Uint8Array);
});
