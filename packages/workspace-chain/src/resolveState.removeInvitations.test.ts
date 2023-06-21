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
  acceptInvitation,
  addInvitation,
  createChain,
  InvalidWorkspaceChainError,
  resolveState,
} from "./index";
import { removeInvitations } from "./removeInvitations";
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

test("should be able to remove an invitation as ADMIN", async () => {
  const createEvent = createChain(keyPairsA.sign);
  const addInvitationEvent = addInvitation({
    prevHash: hashTransaction(createEvent.transaction),
    authorKeyPair: keyPairA,
    expiresAt: getDateIn2Min(),
    role: "EDITOR",
    workspaceId: createEvent.transaction.id,
  });

  const removeInvitationEvent = removeInvitations({
    prevHash: hashTransaction(addInvitationEvent.transaction),
    authorKeyPair: keyPairA,
    invitationIds: [addInvitationEvent.transaction.invitationId],
  });
  const state = resolveState([
    createEvent,
    addInvitationEvent,
    removeInvitationEvent,
  ]);

  expect(state.invitations).toMatchInlineSnapshot(`{}`);
});

test("should be able to remove multiple invitations as ADMIN", async () => {
  const createEvent = createChain(keyPairsA.sign);
  const addInvitationEvent = addInvitation({
    prevHash: hashTransaction(createEvent.transaction),
    authorKeyPair: keyPairA,
    expiresAt: getDateIn2Min(),
    role: "EDITOR",
    workspaceId: createEvent.transaction.id,
  });
  const addInvitationEvent2 = addInvitation({
    prevHash: hashTransaction(addInvitationEvent.transaction),
    authorKeyPair: keyPairA,
    expiresAt: getDateIn2Min(),
    role: "EDITOR",
    workspaceId: createEvent.transaction.id,
  });

  const removeInvitationEvent = removeInvitations({
    prevHash: hashTransaction(addInvitationEvent2.transaction),
    authorKeyPair: keyPairA,
    invitationIds: [
      addInvitationEvent.transaction.invitationId,
      addInvitationEvent2.transaction.invitationId,
    ],
  });
  const state = resolveState([
    createEvent,
    addInvitationEvent,
    addInvitationEvent2,
    removeInvitationEvent,
  ]);

  expect(state.invitations).toMatchInlineSnapshot(`{}`);
});

test("should NOT be able to remove an invitation as EDITOR", async () => {
  const createEvent = createChain(keyPairsA.sign);
  const addInvitationEvent = addInvitation({
    prevHash: hashTransaction(createEvent.transaction),
    authorKeyPair: keyPairA,
    expiresAt: getDateIn2Min(),
    role: "EDITOR",
    workspaceId: createEvent.transaction.id,
  });

  const acceptInvitationEvent = acceptInvitation({
    ...addInvitationEvent.transaction,
    prevHash: hashTransaction(addInvitationEvent.transaction),
    invitationSigningKeyPairSeed:
      addInvitationEvent.invitationSigningKeyPairSeed,
    expiresAt: new Date(addInvitationEvent.transaction.expiresAt),
    authorKeyPair: keyPairB,
  });

  const removeInvitationEvent = removeInvitations({
    prevHash: hashTransaction(acceptInvitationEvent.transaction),
    authorKeyPair: keyPairB,
    invitationIds: [acceptInvitationEvent.transaction.invitationId],
  });

  const chain = [
    createEvent,
    addInvitationEvent,
    acceptInvitationEvent,
    removeInvitationEvent,
  ];
  expect(() => resolveState(chain)).toThrow(InvalidWorkspaceChainError);
  expect(() => resolveState(chain)).toThrow(
    "Not allowed to remove invitations."
  );
});

test("should fail in case the invitation does not exist", async () => {
  const createEvent = createChain(keyPairsA.sign);
  const addInvitationEvent = addInvitation({
    prevHash: hashTransaction(createEvent.transaction),
    authorKeyPair: keyPairA,
    expiresAt: getDateIn2Min(),
    role: "EDITOR",
    workspaceId: createEvent.transaction.id,
  });

  const removeInvitationEvent = removeInvitations({
    prevHash: hashTransaction(addInvitationEvent.transaction),
    authorKeyPair: keyPairA,
    invitationIds: [addInvitationEvent.transaction.invitationId],
  });
  const removeInvitationEvent2 = removeInvitations({
    prevHash: hashTransaction(removeInvitationEvent.transaction),
    authorKeyPair: keyPairA,
    invitationIds: [addInvitationEvent.transaction.invitationId],
  });
  const chain = [
    createEvent,
    addInvitationEvent,
    removeInvitationEvent,
    removeInvitationEvent2,
  ];

  expect(() => resolveState(chain)).toThrow(InvalidWorkspaceChainError);
  expect(() => resolveState(chain)).toThrow(
    "Failed to remove non-existing invitation."
  );
});
