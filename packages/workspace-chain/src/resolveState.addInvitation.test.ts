import sodium from "libsodium-wrappers";
import {
  addInvitation,
  addMember,
  createChain,
  InvalidTrustChainError,
  resolveState,
} from "./index";
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

test("should be able to add a invitation as ADMIN", async () => {
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
  const state = resolveState([createEvent, addInvitationEvent]);
  if (addInvitationEvent.transaction.type !== "add-invitation") {
    throw new Error("Invalid transaction type");
  }
  const invitation =
    state.invitations[addInvitationEvent.transaction.invitationId];
  expect(invitation.role).toBe("EDITOR");
  expect(invitation.invitationDataSignature).toBeDefined();
  expect(invitation.invitationSigningPublicKey).toBeDefined();
  expect(invitation.expiresAt).toBeDefined();
  expect(invitation.addedBy).toBeDefined();
});

test("should not be able to add an invitation as editor", async () => {
  const createEvent = createChain(keyPairsA.sign, {
    [keyPairsA.sign.publicKey]: keyPairsA.box.publicKey,
  });
  const addMemberEvent = addMember(
    hashTransaction(createEvent.transaction),
    keyPairA,
    keyPairsB.sign.publicKey,
    keyPairsB.box.publicKey,
    "EDITOR"
  );
  const addInvitationEvent = addInvitation({
    prevHash: hashTransaction(addMemberEvent.transaction),
    authorKeyPair: keyPairB,
    expiresAt: new Date(),
    role: "EDITOR",
    workspaceId: "test",
  });
  const chain = [createEvent, addMemberEvent, addInvitationEvent];
  expect(() => resolveState(chain)).toThrow(InvalidTrustChainError);
  expect(() => resolveState(chain)).toThrow(
    "Not allowed to add an invitation."
  );
});
