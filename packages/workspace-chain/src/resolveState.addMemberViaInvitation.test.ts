import sodium from "libsodium-wrappers";
import {
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
  addInvitation,
  addMemberViaInvitation,
  createChain,
  InvalidTrustChainError,
  resolveState,
} from "./index";
import { hashTransaction } from "./utils";

let keyPairA: sodium.KeyPair;
let keyPairsA: KeyPairs;
let keyPairB: sodium.KeyPair;
let keyPairsB: KeyPairs;
let keyPairC: sodium.KeyPair;
let keyPairsC: KeyPairs;
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
  keyPairC = getKeyPairC();
  keyPairsC = getKeyPairsC();
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
});

test("should be able to add a member via an invitation", async () => {
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
    ...addInvitationEvent.transaction,
    ...mainDevice,
    expiresAt: new Date(addInvitationEvent.transaction.expiresAt),
  });

  const addMemberViaInvitationEvent = addMemberViaInvitation({
    prevHash: hashTransaction(addInvitationEvent.transaction),
    authorKeyPair: keyPairA,
    acceptInvitationSignature: sodium.to_base64(acceptInvitationSignature),
    ...addInvitationEvent.transaction,
    ...mainDevice,
    expiresAt: new Date(addInvitationEvent.transaction.expiresAt),
  });
  const state = resolveState([
    createEvent,
    addInvitationEvent,
    addMemberViaInvitationEvent,
  ]);
  expect(state.members).toMatchInlineSnapshot(`
    {
      "74IPzs2dhoERLRuxeS7zadzEvKfb7IqOK-jKu0mQxIM": {
        "addedBy": [
          "74IPzs2dhoERLRuxeS7zadzEvKfb7IqOK-jKu0mQxIM",
        ],
        "lockboxPublicKey": "wevxDsZ-L7wpy3ePZcQNfG8WDh0wB0d27phr5OMdLwI",
        "role": "ADMIN",
      },
      "MTDhqVIMflTD0Car-KSP1MWCIEYqs2LBaXfU20di0tY": {
        "addedBy": [
          "74IPzs2dhoERLRuxeS7zadzEvKfb7IqOK-jKu0mQxIM",
        ],
        "lockboxPublicKey": "b_skeL8qudNQji-HuOldPNFDzYSBENNqmFMlawhtrHg",
        "role": "EDITOR",
      },
    }
  `);
});

test("should be able to add a member twice", async () => {
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
    ...addInvitationEvent.transaction,
    ...mainDevice,
    expiresAt: new Date(addInvitationEvent.transaction.expiresAt),
  });

  const addMemberViaInvitationEvent = addMemberViaInvitation({
    prevHash: hashTransaction(addInvitationEvent.transaction),
    authorKeyPair: keyPairA,
    acceptInvitationSignature: sodium.to_base64(acceptInvitationSignature),
    ...addInvitationEvent.transaction,
    ...mainDevice,
    expiresAt: new Date(addInvitationEvent.transaction.expiresAt),
  });

  const addMemberViaInvitationEvent2 = addMemberViaInvitation({
    prevHash: hashTransaction(addMemberViaInvitationEvent.transaction),
    authorKeyPair: keyPairA,
    acceptInvitationSignature: sodium.to_base64(acceptInvitationSignature),
    ...addInvitationEvent.transaction,
    ...mainDevice,
    expiresAt: new Date(addInvitationEvent.transaction.expiresAt),
  });

  const chain = [
    createEvent,
    addInvitationEvent,
    addMemberViaInvitationEvent,
    addMemberViaInvitationEvent2,
  ];
  expect(() => resolveState(chain)).toThrow(InvalidTrustChainError);
  expect(() => resolveState(chain)).toThrow("Member already exists.");
});

test("should fail if the author is not a member of the chain", async () => {
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
    ...addInvitationEvent.transaction,
    ...mainDevice,
    expiresAt: new Date(addInvitationEvent.transaction.expiresAt),
  });

  const addMemberViaInvitationEvent = addMemberViaInvitation({
    prevHash: hashTransaction(addInvitationEvent.transaction),
    authorKeyPair: keyPairC,
    acceptInvitationSignature: sodium.to_base64(acceptInvitationSignature),
    ...addInvitationEvent.transaction,
    ...mainDevice,
    expiresAt: new Date(addInvitationEvent.transaction.expiresAt),
  });
  const chain = [createEvent, addInvitationEvent, addMemberViaInvitationEvent];
  expect(() => resolveState(chain)).toThrow(InvalidTrustChainError);
  expect(() => resolveState(chain)).toThrow("Author is not a member.");
});
