import sodium from "react-native-libsodium";
import {
  getKeyPairA,
  getKeyPairB,
  getKeyPairsA,
  getKeyPairsB,
  getKeyPairsC,
  KeyPairs,
} from "../test/testUtils";
import { addAuthorToEvent } from "./addAuthorToEvent";
import { InvalidTrustChainError } from "./errors";
import { addMember, createChain, resolveState } from "./index";
import { hashTransaction } from "./utils";

let keyPairA: sodium.KeyPair;
let keyPairsA: KeyPairs;
let keyPairB: sodium.KeyPair;
let keyPairsB: KeyPairs;
let keyPairsC: KeyPairs;

beforeAll(async () => {
  await sodium.ready;
  keyPairA = getKeyPairA();
  keyPairsA = getKeyPairsA();
  keyPairB = getKeyPairB();
  keyPairsB = getKeyPairsB();
  keyPairsC = getKeyPairsC();
});

test("should be able to add a member as admin", async () => {
  const createEvent = createChain(keyPairsA.sign, {
    [keyPairsA.sign.publicKey]: keyPairsA.box.publicKey,
  });
  const addMemberEvent = addMember(
    hashTransaction(createEvent.transaction),
    keyPairA,
    keyPairsB.sign.publicKey,
    keyPairsB.box.publicKey,
    "ADMIN"
  );
  const addMemberEvent2 = addMember(
    hashTransaction(addMemberEvent.transaction),
    keyPairB,
    keyPairsC.sign.publicKey,
    keyPairsC.box.publicKey,
    "EDITOR"
  );
  const state = resolveState([createEvent, addMemberEvent, addMemberEvent2]);
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
      "ZKcwjAMAaSiq7k3MQVQUZ6aa7kBreK__5hkGI4SCltk": {
        "addedBy": [
          "MTDhqVIMflTD0Car-KSP1MWCIEYqs2LBaXfU20di0tY",
        ],
        "lockboxPublicKey": "0hUuO22MoTa8X65ZvpR9KcfUwF_B2aIvLORPjuaofBg",
        "role": "EDITOR",
      },
    }
  `);
});

test("should not be able to add a member as editor", async () => {
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
  const addMemberEvent2 = addMember(
    hashTransaction(addMemberEvent.transaction),
    keyPairB,
    keyPairsC.sign.publicKey,
    keyPairsC.box.publicKey,
    "EDITOR"
  );
  const chain = [createEvent, addMemberEvent, addMemberEvent2];
  expect(() => resolveState(chain)).toThrow(InvalidTrustChainError);
  expect(() => resolveState(chain)).toThrow("Not allowed to add a member.");
});

test("should be able to add an admin as admins", async () => {
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
  const addAdminEvent2 = addMember(
    hashTransaction(addAdminEvent.transaction),
    keyPairA,
    keyPairsC.sign.publicKey,
    keyPairsC.box.publicKey,
    "ADMIN"
  );
  const addAdminEvent3 = addAuthorToEvent(addAdminEvent2, keyPairB);
  const state = resolveState([createEvent, addAdminEvent, addAdminEvent3]);
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
      "ZKcwjAMAaSiq7k3MQVQUZ6aa7kBreK__5hkGI4SCltk": {
        "addedBy": [
          "74IPzs2dhoERLRuxeS7zadzEvKfb7IqOK-jKu0mQxIM",
          "MTDhqVIMflTD0Car-KSP1MWCIEYqs2LBaXfU20di0tY",
        ],
        "lockboxPublicKey": "0hUuO22MoTa8X65ZvpR9KcfUwF_B2aIvLORPjuaofBg",
        "role": "ADMIN",
      },
    }
  `);
});

test("should not be able to add the same admin twice as author", async () => {
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
  const addAdminEvent2 = addMember(
    hashTransaction(addAdminEvent.transaction),
    keyPairA,
    keyPairsB.sign.publicKey,
    keyPairsB.box.publicKey,
    "ADMIN"
  );
  const addAdminEvent3 = addAuthorToEvent(addAdminEvent2, keyPairA);
  const chain = [createEvent, addAdminEvent, addAdminEvent3];
  expect(() => resolveState(chain)).toThrow(InvalidTrustChainError);
  expect(() => resolveState(chain)).toThrow(
    "An author can sign the event only once."
  );
});

test("should not be able to add the same member twice", async () => {
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
  const addAdminEvent2 = addMember(
    hashTransaction(addAdminEvent.transaction),
    keyPairA,
    keyPairsB.sign.publicKey,
    keyPairsB.box.publicKey,
    "ADMIN"
  );
  const chain = [createEvent, addAdminEvent, addAdminEvent2];
  expect(() => resolveState(chain)).toThrow(InvalidTrustChainError);
  expect(() => resolveState(chain)).toThrow("Member already exists.");
});
