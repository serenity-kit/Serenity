import sodium from "react-native-libsodium";
import {
  getDate2MinAgo,
  getDateIn2Min,
  getKeyPairA,
  getKeyPairB,
  getKeyPairC,
  getKeyPairsA,
  getKeyPairsB,
  getKeyPairsC,
  KeyPairs,
} from "../test/testUtils";
import { acceptInvitation } from "./acceptInvitation";
import {
  addAuthorToEvent,
  addInvitation,
  AddInvitationResult,
  createChain,
  CreateChainWorkspaceChainEvent,
  InvalidWorkspaceChainError,
  resolveState,
} from "./index";
import { hashTransaction } from "./utils";

let keyPairA: sodium.KeyPair;
let keyPairsA: KeyPairs;
let keyPairB: sodium.KeyPair;
let keyPairsB: KeyPairs;
let keyPairC: sodium.KeyPair;
let keyPairsC: KeyPairs;
let createEvent: CreateChainWorkspaceChainEvent;
let addInvitationEvent: AddInvitationResult;

beforeAll(async () => {
  await sodium.ready;
  keyPairA = getKeyPairA();
  keyPairsA = getKeyPairsA();
  keyPairB = getKeyPairB();
  keyPairsB = getKeyPairsB();
  keyPairC = getKeyPairC();
  keyPairsC = getKeyPairsC();
  createEvent = createChain(keyPairsA.sign);
  addInvitationEvent = addInvitation({
    prevHash: hashTransaction(createEvent.transaction),
    authorKeyPair: keyPairA,
    expiresAt: getDateIn2Min(),
    role: "EDITOR",
    workspaceId: createEvent.transaction.id,
  });
});

test("should be able to add a member via an invitation", async () => {
  const acceptInvitationEvent = acceptInvitation({
    ...addInvitationEvent.transaction,
    prevHash: hashTransaction(addInvitationEvent.transaction),
    invitationSigningKeyPairSeed:
      addInvitationEvent.invitationSigningKeyPairSeed,
    expiresAt: new Date(addInvitationEvent.transaction.expiresAt),
    authorKeyPair: keyPairB,
  });

  const state = resolveState([
    createEvent,
    addInvitationEvent,
    acceptInvitationEvent,
  ]);
  expect(state.members).toMatchInlineSnapshot(`
    {
      "74IPzs2dhoERLRuxeS7zadzEvKfb7IqOK-jKu0mQxIM": {
        "addedBy": [
          "74IPzs2dhoERLRuxeS7zadzEvKfb7IqOK-jKu0mQxIM",
        ],
        "role": "ADMIN",
      },
      "MTDhqVIMflTD0Car-KSP1MWCIEYqs2LBaXfU20di0tY": {
        "addedBy": [
          "74IPzs2dhoERLRuxeS7zadzEvKfb7IqOK-jKu0mQxIM",
        ],
        "role": "EDITOR",
      },
    }
  `);
});

test("should not be able to accept the same invitation twice", async () => {
  const acceptInvitationEvent = acceptInvitation({
    ...addInvitationEvent.transaction,
    prevHash: hashTransaction(addInvitationEvent.transaction),
    invitationSigningKeyPairSeed:
      addInvitationEvent.invitationSigningKeyPairSeed,
    expiresAt: new Date(addInvitationEvent.transaction.expiresAt),
    authorKeyPair: keyPairB,
  });

  const acceptInvitationEvent2 = acceptInvitation({
    ...addInvitationEvent.transaction,
    prevHash: hashTransaction(acceptInvitationEvent.transaction),
    invitationSigningKeyPairSeed:
      addInvitationEvent.invitationSigningKeyPairSeed,
    expiresAt: new Date(addInvitationEvent.transaction.expiresAt),
    authorKeyPair: keyPairB,
  });

  const chain = [
    createEvent,
    addInvitationEvent,
    acceptInvitationEvent,
    acceptInvitationEvent2,
  ];
  expect(() => resolveState(chain)).toThrow(InvalidWorkspaceChainError);
  expect(() => resolveState(chain)).toThrow(
    "Author is already a member of the workspace."
  );
});

test("should fail to verify if the invitationId has been modified", async () => {
  const acceptInvitationEvent = acceptInvitation({
    ...addInvitationEvent.transaction,
    prevHash: hashTransaction(addInvitationEvent.transaction),
    invitationSigningKeyPairSeed:
      addInvitationEvent.invitationSigningKeyPairSeed,
    expiresAt: new Date(addInvitationEvent.transaction.expiresAt),
    authorKeyPair: keyPairB,
  });

  acceptInvitationEvent.transaction.invitationId = "WRONG_ID";

  const chain = [createEvent, addInvitationEvent, acceptInvitationEvent];
  expect(() => resolveState(chain)).toThrow(InvalidWorkspaceChainError);
  expect(() => resolveState(chain)).toThrow(
    "Invalid signature for author MTDhqVIMflTD0Car-KSP1MWCIEYqs2LBaXfU20di0tY."
  );
});

test("should fail to verify if expiresAt has been modified", async () => {
  const acceptInvitationEvent = acceptInvitation({
    ...addInvitationEvent.transaction,
    prevHash: hashTransaction(addInvitationEvent.transaction),
    invitationSigningKeyPairSeed:
      addInvitationEvent.invitationSigningKeyPairSeed,
    expiresAt: new Date(addInvitationEvent.transaction.expiresAt),
    authorKeyPair: keyPairB,
  });

  acceptInvitationEvent.transaction.expiresAt = getDate2MinAgo().toISOString();

  const chain = [createEvent, addInvitationEvent, acceptInvitationEvent];
  expect(() => resolveState(chain)).toThrow(InvalidWorkspaceChainError);
  expect(() => resolveState(chain)).toThrow(
    "Invalid signature for author MTDhqVIMflTD0Car-KSP1MWCIEYqs2LBaXfU20di0tY."
  );
});

test("should fail to verify if the role has been modified", async () => {
  const acceptInvitationEvent = acceptInvitation({
    ...addInvitationEvent.transaction,
    prevHash: hashTransaction(addInvitationEvent.transaction),
    invitationSigningKeyPairSeed:
      addInvitationEvent.invitationSigningKeyPairSeed,
    expiresAt: new Date(addInvitationEvent.transaction.expiresAt),
    authorKeyPair: keyPairB,
  });

  acceptInvitationEvent.transaction.role = "ADMIN";

  const chain = [createEvent, addInvitationEvent, acceptInvitationEvent];
  expect(() => resolveState(chain)).toThrow(InvalidWorkspaceChainError);
  expect(() => resolveState(chain)).toThrow(
    "Invalid signature for author MTDhqVIMflTD0Car-KSP1MWCIEYqs2LBaXfU20di0tY."
  );
});

test("should fail to verify if the workspaceId has been modified", async () => {
  const acceptInvitationEvent = acceptInvitation({
    ...addInvitationEvent.transaction,
    prevHash: hashTransaction(addInvitationEvent.transaction),
    invitationSigningKeyPairSeed:
      addInvitationEvent.invitationSigningKeyPairSeed,
    expiresAt: new Date(addInvitationEvent.transaction.expiresAt),
    authorKeyPair: keyPairB,
  });

  acceptInvitationEvent.transaction.workspaceId = "WRONG_ID";

  const chain = [createEvent, addInvitationEvent, acceptInvitationEvent];
  expect(() => resolveState(chain)).toThrow(InvalidWorkspaceChainError);
  expect(() => resolveState(chain)).toThrow(
    "Invalid signature for author MTDhqVIMflTD0Car-KSP1MWCIEYqs2LBaXfU20di0tY."
  );
});

test("should fail in case multiple authors signed the acceptInvitationEvent", async () => {
  const acceptInvitationEvent = acceptInvitation({
    ...addInvitationEvent.transaction,
    prevHash: hashTransaction(addInvitationEvent.transaction),
    invitationSigningKeyPairSeed:
      addInvitationEvent.invitationSigningKeyPairSeed,
    expiresAt: new Date(addInvitationEvent.transaction.expiresAt),
    authorKeyPair: keyPairB,
  });
  const acceptInvitationEvent2 = addAuthorToEvent(
    acceptInvitationEvent,
    keyPairC
  );

  const chain = [createEvent, addInvitationEvent, acceptInvitationEvent2];
  expect(() => resolveState(chain)).toThrow(InvalidWorkspaceChainError);
  expect(() => resolveState(chain)).toThrow(
    "An accept-invitation event can only be signed by one author."
  );
});
