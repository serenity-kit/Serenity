import sodium from "react-native-libsodium";
import {
  getDateIn2Min,
  getKeyPairA,
  getKeyPairB,
  getKeyPairsA,
  getKeyPairsB,
  KeyPairs,
} from "../test/testUtils";
import {
  addInvitation,
  addMember,
  createChain,
  InvalidWorkspaceChainError,
  resolveState,
} from "./index";
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
  const createEvent = createChain(keyPairsA.sign);
  const addInvitationEvent = addInvitation({
    prevHash: hashTransaction(createEvent.transaction),
    authorKeyPair: keyPairA,
    expiresAt: getDateIn2Min(),
    role: "EDITOR",
    workspaceId: createEvent.transaction.id,
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
  const createEvent = createChain(keyPairsA.sign);
  const addMemberEvent = addMember(
    hashTransaction(createEvent.transaction),
    keyPairA,
    keyPairsB.sign.publicKey,
    "EDITOR"
  );
  const addInvitationEvent = addInvitation({
    prevHash: hashTransaction(addMemberEvent.transaction),
    authorKeyPair: keyPairB,
    expiresAt: getDateIn2Min(),
    role: "EDITOR",
    workspaceId: createEvent.transaction.id,
  });
  const chain = [createEvent, addMemberEvent, addInvitationEvent];
  expect(() => resolveState(chain)).toThrow(InvalidWorkspaceChainError);
  expect(() => resolveState(chain)).toThrow(
    "Not allowed to add an invitation."
  );
});

test("should not be able to add an invitation with a wrong workspaceId", async () => {
  const createEvent = createChain(keyPairsA.sign);
  const addInvitationEvent = addInvitation({
    prevHash: hashTransaction(createEvent.transaction),
    authorKeyPair: keyPairA,
    expiresAt: getDateIn2Min(),
    role: "EDITOR",
    workspaceId: "WRONG_ID",
  });
  const chain = [createEvent, addInvitationEvent];
  expect(() => resolveState(chain)).toThrow(InvalidWorkspaceChainError);
  expect(() => resolveState(chain)).toThrow("Invalid invitation signature.");
});

test("should not be able to add an invitation with a wrong role", async () => {
  const createEvent = createChain(keyPairsA.sign);
  const addInvitationEvent = addInvitation({
    prevHash: hashTransaction(createEvent.transaction),
    authorKeyPair: keyPairA,
    expiresAt: getDateIn2Min(),
    // @ts-expect-error
    role: "WOW",
    workspaceId: "WRONG_ID",
  });
  const chain = [createEvent, addInvitationEvent];
  expect(() => resolveState(chain)).toThrow(InvalidWorkspaceChainError);
  expect(() => resolveState(chain)).toThrow("Invalid invitation signature.");
});
