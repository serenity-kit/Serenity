import sodium from "react-native-libsodium";
import {
  getKeyPairA,
  getKeyPairB,
  getKeyPairsA,
  getKeyPairsB,
  KeyPairs,
} from "../test/testUtils";
import { addAuthorToEvent } from "./addAuthorToEvent";
import { InvalidTrustChainError } from "./errors";
import { addMember, createChain, resolveState, updateMember } from "./index";
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

test("should be able to promote an EDITOR to an ADMIN", async () => {
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
  const updateMemberEvent = updateMember(
    hashTransaction(addMemberEvent.transaction),
    keyPairA,
    keyPairsB.sign.publicKey,
    "ADMIN"
  );
  const state = resolveState([createEvent, addMemberEvent, updateMemberEvent]);
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
        "role": "ADMIN",
      },
    }
  `);
});

test("should be able to demote an ADMIN to an EDITOR", async () => {
  const createEvent = createChain(keyPairsA.sign, {
    [keyPairsA.sign.publicKey]: keyPairsA.box.publicKey,
  });
  const addAdminEvent = addMember(
    hashTransaction(createEvent.transaction),
    keyPairA,
    keyPairsB.sign.publicKey,
    keyPairsB.box.publicKey,
    "ADMIN"
  );
  const updateMemberEvent = updateMember(
    hashTransaction(addAdminEvent.transaction),
    keyPairA,
    keyPairsB.sign.publicKey,
    "EDITOR"
  );
  const updateMemberEvent2 = addAuthorToEvent(updateMemberEvent, keyPairB);
  const state = resolveState([createEvent, addAdminEvent, updateMemberEvent2]);
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

test("should fail to demote the last ADMIN to a EDITOR", async () => {
  const createEvent = createChain(keyPairsA.sign, {
    [keyPairsA.sign.publicKey]: keyPairsA.box.publicKey,
  });
  const updateMemberEvent = updateMember(
    hashTransaction(createEvent.transaction),
    keyPairA,
    keyPairsA.sign.publicKey,
    "EDITOR"
  );
  const chain = [createEvent, updateMemberEvent];
  expect(() => resolveState(chain)).toThrow(InvalidTrustChainError);
  expect(() => resolveState(chain)).toThrow(
    "Not allowed to demote the last admin."
  );
});

test("should fail to promote an ADMIN that is already an ADMIN", async () => {
  const createEvent = createChain(keyPairsA.sign, {
    [keyPairsA.sign.publicKey]: keyPairsA.box.publicKey,
  });
  const addAdminEvent = addMember(
    hashTransaction(createEvent.transaction),
    keyPairA,
    keyPairsB.sign.publicKey,
    keyPairsB.box.publicKey,
    "ADMIN"
  );
  const updateMemberEvent = updateMember(
    hashTransaction(addAdminEvent.transaction),
    keyPairA,
    keyPairsB.sign.publicKey,
    "ADMIN"
  );
  const updateMemberEvent2 = addAuthorToEvent(updateMemberEvent, keyPairB);
  const chain = [createEvent, addAdminEvent, updateMemberEvent2];
  expect(() => resolveState(chain)).toThrow(InvalidTrustChainError);
  expect(() => resolveState(chain)).toThrow("Not allowed member update.");
});

test("should fail to update a member if nothing changes", async () => {
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
  const updateMemberEvent = updateMember(
    hashTransaction(addMemberEvent.transaction),
    keyPairA,
    keyPairsB.sign.publicKey,
    "EDITOR"
  );
  const chain = [createEvent, addMemberEvent, updateMemberEvent];
  expect(() => resolveState(chain)).toThrow(InvalidTrustChainError);
  expect(() => resolveState(chain)).toThrow("Not allowed member update.");
});
