import sodium from "react-native-libsodium";
import {
  getKeyPairA,
  getKeyPairB,
  getKeyPairC,
  getKeyPairsA,
  getKeyPairsB,
  getKeyPairsC,
  KeyPairs,
} from "../test/testUtils";
import { InvalidTrustChainError } from "./errors";
import { addMember, createChain, removeMember, resolveState } from "./index";
import { hashTransaction } from "./utils";

let keyPairA: sodium.KeyPair;
let keyPairsA: KeyPairs;
let keyPairB: sodium.KeyPair;
let keyPairC: sodium.KeyPair;
let keyPairsB: KeyPairs;
let keyPairsC: KeyPairs;

beforeAll(async () => {
  await sodium.ready;
  keyPairA = getKeyPairA();
  keyPairsA = getKeyPairsA();
  keyPairB = getKeyPairB();
  keyPairsB = getKeyPairsB();
  keyPairC = getKeyPairC();
  keyPairsC = getKeyPairsC();
});

test("should be able to remove a member as ADMIN", async () => {
  const createEvent = createChain(keyPairsA.sign);
  const addMemberEvent = addMember(
    hashTransaction(createEvent.transaction),
    keyPairA,
    keyPairsB.sign.publicKey,
    "EDITOR"
  );
  const removeMemberEvent = removeMember(
    hashTransaction(addMemberEvent.transaction),
    keyPairA,
    sodium.to_base64(keyPairB.publicKey)
  );
  const state = resolveState([createEvent, addMemberEvent, removeMemberEvent]);
  expect(state.members).toMatchInlineSnapshot(`
    {
      "74IPzs2dhoERLRuxeS7zadzEvKfb7IqOK-jKu0mQxIM": {
        "addedBy": [
          "74IPzs2dhoERLRuxeS7zadzEvKfb7IqOK-jKu0mQxIM",
        ],
        "role": "ADMIN",
      },
    }
  `);
});

test("should be able to remove a member as ADMIN added by an ADMIN", async () => {
  const createEvent = createChain(keyPairsA.sign);
  const addMemberEvent = addMember(
    hashTransaction(createEvent.transaction),
    keyPairA,
    keyPairsB.sign.publicKey,
    "ADMIN"
  );
  const addMemberEvent2 = addMember(
    hashTransaction(addMemberEvent.transaction),
    keyPairA,
    keyPairsC.sign.publicKey,
    "EDITOR"
  );
  const removeMemberEvent = removeMember(
    hashTransaction(addMemberEvent2.transaction),
    keyPairB,
    sodium.to_base64(keyPairC.publicKey)
  );
  const state = resolveState([
    createEvent,
    addMemberEvent,
    addMemberEvent2,
    removeMemberEvent,
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
        "role": "ADMIN",
      },
    }
  `);
});

test("should not be able to remove a member as EDITOR", async () => {
  const createEvent = createChain(keyPairsA.sign);
  const addMemberEvent = addMember(
    hashTransaction(createEvent.transaction),
    keyPairA,
    keyPairsB.sign.publicKey,
    "EDITOR"
  );
  const addMemberEvent2 = addMember(
    hashTransaction(addMemberEvent.transaction),
    keyPairA,
    keyPairsC.sign.publicKey,
    "EDITOR"
  );
  const removeMemberEvent = removeMember(
    hashTransaction(addMemberEvent2.transaction),
    keyPairB,
    sodium.to_base64(keyPairC.publicKey)
  );
  const chain = [
    createEvent,
    addMemberEvent,
    addMemberEvent2,
    removeMemberEvent,
  ];
  expect(() => resolveState(chain)).toThrow(InvalidTrustChainError);
  expect(() => resolveState(chain)).toThrow("Not allowed to remove a member.");
});

test("should not be able to remove the last admin", async () => {
  const createEvent = createChain(keyPairsA.sign);
  const addMemberEvent = addMember(
    hashTransaction(createEvent.transaction),
    keyPairA,
    keyPairsB.sign.publicKey,
    "EDITOR"
  );
  const removeMemberEvent = removeMember(
    hashTransaction(addMemberEvent.transaction),
    keyPairA,
    sodium.to_base64(keyPairA.publicKey)
  );
  const chain = [createEvent, addMemberEvent, removeMemberEvent];
  expect(() => resolveState(chain)).toThrow(InvalidTrustChainError);
  expect(() => resolveState(chain)).toThrow(
    "Not allowed to remove the last admin."
  );
});

test("should throw in case the member does not exist", async () => {
  const createEvent = createChain(keyPairsA.sign);
  const removeMemberEvent = removeMember(
    hashTransaction(createEvent.transaction),
    keyPairB,
    sodium.to_base64(keyPairB.publicKey)
  );
  const chain = [createEvent, removeMemberEvent];
  expect(() => resolveState(chain)).toThrow(InvalidTrustChainError);
  expect(() => resolveState(chain)).toThrow(
    "Failed to remove non-existing member."
  );
});

test("should not be able to remove the last member", async () => {
  const createEvent = createChain(keyPairsA.sign);
  const eventRemoveMember = removeMember(
    hashTransaction(createEvent.transaction),
    keyPairA,
    sodium.to_base64(keyPairA.publicKey)
  );
  expect(() => resolveState([createEvent, eventRemoveMember])).toThrow(
    InvalidTrustChainError
  );
  expect(() => resolveState([createEvent, eventRemoveMember])).toThrow(
    "Not allowed to remove last member."
  );
});
