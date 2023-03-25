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
import {
  addInvitation,
  addMemberViaInvitation,
  createChain,
  resolveState,
} from "./index";
import { hashTransaction } from "./utils";

let keyPairA: sodium.KeyPair;
let keyPairsA: KeyPairs;
let keyPairB: sodium.KeyPair;
let keyPairsB: KeyPairs;
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

// TODO should not be able to add a member twice via an invitation
// TODO should fail to add a member if the event author is not part of the workspace
