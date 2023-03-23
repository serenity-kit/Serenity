import sodium from "libsodium-wrappers";
import { addAuthorToEvent } from "./addAuthorToEvent";
import { InvalidTrustChainError } from "./errors";
import { addMember, createChain, resolveState, updateMember } from "./index";
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

test("should be able to promote a member to an admin", async () => {
  const createEvent = createChain(keyPairsA.sign, {
    [keyPairsA.sign.publicKey]: keyPairsA.box.publicKey,
  });
  const addMemberEvent = addMember(
    hashTransaction(createEvent.transaction),
    keyPairA,
    keyPairsB.sign.publicKey,
    keyPairsB.box.publicKey,
    { isAdmin: false, canAddMembers: true, canRemoveMembers: false }
  );
  const updateMemberEvent = updateMember(
    hashTransaction(addMemberEvent.transaction),
    keyPairA,
    keyPairsB.sign.publicKey,
    { isAdmin: true, canAddMembers: true, canRemoveMembers: true }
  );
  const state = resolveState([createEvent, addMemberEvent, updateMemberEvent]);
  expect(state.members).toMatchInlineSnapshot(`
    {
      "74IPzs2dhoERLRuxeS7zadzEvKfb7IqOK-jKu0mQxIM": {
        "addedBy": [
          "74IPzs2dhoERLRuxeS7zadzEvKfb7IqOK-jKu0mQxIM",
        ],
        "canAddMembers": true,
        "canRemoveMembers": true,
        "isAdmin": true,
        "lockboxPublicKey": "wevxDsZ-L7wpy3ePZcQNfG8WDh0wB0d27phr5OMdLwI",
      },
      "MTDhqVIMflTD0Car-KSP1MWCIEYqs2LBaXfU20di0tY": {
        "addedBy": [
          "74IPzs2dhoERLRuxeS7zadzEvKfb7IqOK-jKu0mQxIM",
        ],
        "canAddMembers": true,
        "canRemoveMembers": true,
        "isAdmin": true,
        "lockboxPublicKey": "b_skeL8qudNQji-HuOldPNFDzYSBENNqmFMlawhtrHg",
      },
    }
  `);
});

test("should be able to demote an admin to a member", async () => {
  const createEvent = createChain(keyPairsA.sign, {
    [keyPairsA.sign.publicKey]: keyPairsA.box.publicKey,
  });
  const addAdminEvent = addMember(
    hashTransaction(createEvent.transaction),
    keyPairA,
    keyPairsB.sign.publicKey,
    keyPairsB.box.publicKey,
    { isAdmin: true, canAddMembers: true, canRemoveMembers: true }
  );
  const updateMemberEvent = updateMember(
    hashTransaction(addAdminEvent.transaction),
    keyPairA,
    keyPairsB.sign.publicKey,
    { isAdmin: false, canAddMembers: false, canRemoveMembers: false }
  );
  const updateMemberEvent2 = addAuthorToEvent(updateMemberEvent, keyPairB);
  const state = resolveState([createEvent, addAdminEvent, updateMemberEvent2]);
  expect(state.members).toMatchInlineSnapshot(`
    {
      "74IPzs2dhoERLRuxeS7zadzEvKfb7IqOK-jKu0mQxIM": {
        "addedBy": [
          "74IPzs2dhoERLRuxeS7zadzEvKfb7IqOK-jKu0mQxIM",
        ],
        "canAddMembers": true,
        "canRemoveMembers": true,
        "isAdmin": true,
        "lockboxPublicKey": "wevxDsZ-L7wpy3ePZcQNfG8WDh0wB0d27phr5OMdLwI",
      },
      "MTDhqVIMflTD0Car-KSP1MWCIEYqs2LBaXfU20di0tY": {
        "addedBy": [
          "74IPzs2dhoERLRuxeS7zadzEvKfb7IqOK-jKu0mQxIM",
        ],
        "canAddMembers": false,
        "canRemoveMembers": false,
        "isAdmin": false,
        "lockboxPublicKey": "b_skeL8qudNQji-HuOldPNFDzYSBENNqmFMlawhtrHg",
      },
    }
  `);
});

test("should be able to update a member's canAddMembers", async () => {
  const createEvent = createChain(keyPairsA.sign, {
    [keyPairsA.sign.publicKey]: keyPairsA.box.publicKey,
  });
  const addMemberEvent = addMember(
    hashTransaction(createEvent.transaction),
    keyPairA,
    keyPairsB.sign.publicKey,
    keyPairsB.box.publicKey,
    { isAdmin: false, canAddMembers: false, canRemoveMembers: false }
  );
  const updateMemberEvent = updateMember(
    hashTransaction(addMemberEvent.transaction),
    keyPairA,
    keyPairsB.sign.publicKey,
    { isAdmin: false, canAddMembers: true, canRemoveMembers: false }
  );
  const state = resolveState([createEvent, addMemberEvent, updateMemberEvent]);
  expect(state.members).toMatchInlineSnapshot(`
    {
      "74IPzs2dhoERLRuxeS7zadzEvKfb7IqOK-jKu0mQxIM": {
        "addedBy": [
          "74IPzs2dhoERLRuxeS7zadzEvKfb7IqOK-jKu0mQxIM",
        ],
        "canAddMembers": true,
        "canRemoveMembers": true,
        "isAdmin": true,
        "lockboxPublicKey": "wevxDsZ-L7wpy3ePZcQNfG8WDh0wB0d27phr5OMdLwI",
      },
      "MTDhqVIMflTD0Car-KSP1MWCIEYqs2LBaXfU20di0tY": {
        "addedBy": [
          "74IPzs2dhoERLRuxeS7zadzEvKfb7IqOK-jKu0mQxIM",
        ],
        "canAddMembers": true,
        "canRemoveMembers": false,
        "isAdmin": false,
        "lockboxPublicKey": "b_skeL8qudNQji-HuOldPNFDzYSBENNqmFMlawhtrHg",
      },
    }
  `);
});

test("should be able to update a member's canRemoveMembers", async () => {
  const createEvent = createChain(keyPairsA.sign, {
    [keyPairsA.sign.publicKey]: keyPairsA.box.publicKey,
  });
  const addMemberEvent = addMember(
    hashTransaction(createEvent.transaction),
    keyPairA,
    keyPairsB.sign.publicKey,
    keyPairsB.box.publicKey,
    { isAdmin: false, canAddMembers: false, canRemoveMembers: false }
  );
  const updateMemberEvent = updateMember(
    hashTransaction(addMemberEvent.transaction),
    keyPairA,
    keyPairsB.sign.publicKey,
    { isAdmin: false, canAddMembers: false, canRemoveMembers: true }
  );
  const state = resolveState([createEvent, addMemberEvent, updateMemberEvent]);
  expect(state.members).toMatchInlineSnapshot(`
    {
      "74IPzs2dhoERLRuxeS7zadzEvKfb7IqOK-jKu0mQxIM": {
        "addedBy": [
          "74IPzs2dhoERLRuxeS7zadzEvKfb7IqOK-jKu0mQxIM",
        ],
        "canAddMembers": true,
        "canRemoveMembers": true,
        "isAdmin": true,
        "lockboxPublicKey": "wevxDsZ-L7wpy3ePZcQNfG8WDh0wB0d27phr5OMdLwI",
      },
      "MTDhqVIMflTD0Car-KSP1MWCIEYqs2LBaXfU20di0tY": {
        "addedBy": [
          "74IPzs2dhoERLRuxeS7zadzEvKfb7IqOK-jKu0mQxIM",
        ],
        "canAddMembers": false,
        "canRemoveMembers": true,
        "isAdmin": false,
        "lockboxPublicKey": "b_skeL8qudNQji-HuOldPNFDzYSBENNqmFMlawhtrHg",
      },
    }
  `);
});

test("should be able to update a member's canAddMembers and canRemoveMembers", async () => {
  const createEvent = createChain(keyPairsA.sign, {
    [keyPairsA.sign.publicKey]: keyPairsA.box.publicKey,
  });
  const addMemberEvent = addMember(
    hashTransaction(createEvent.transaction),
    keyPairA,
    keyPairsB.sign.publicKey,
    keyPairsB.box.publicKey,
    { isAdmin: false, canAddMembers: false, canRemoveMembers: false }
  );
  const updateMemberEvent = updateMember(
    hashTransaction(addMemberEvent.transaction),
    keyPairA,
    keyPairsB.sign.publicKey,
    { isAdmin: false, canAddMembers: true, canRemoveMembers: true }
  );
  const state = resolveState([createEvent, addMemberEvent, updateMemberEvent]);
  expect(state.members).toMatchInlineSnapshot(`
    {
      "74IPzs2dhoERLRuxeS7zadzEvKfb7IqOK-jKu0mQxIM": {
        "addedBy": [
          "74IPzs2dhoERLRuxeS7zadzEvKfb7IqOK-jKu0mQxIM",
        ],
        "canAddMembers": true,
        "canRemoveMembers": true,
        "isAdmin": true,
        "lockboxPublicKey": "wevxDsZ-L7wpy3ePZcQNfG8WDh0wB0d27phr5OMdLwI",
      },
      "MTDhqVIMflTD0Car-KSP1MWCIEYqs2LBaXfU20di0tY": {
        "addedBy": [
          "74IPzs2dhoERLRuxeS7zadzEvKfb7IqOK-jKu0mQxIM",
        ],
        "canAddMembers": true,
        "canRemoveMembers": true,
        "isAdmin": false,
        "lockboxPublicKey": "b_skeL8qudNQji-HuOldPNFDzYSBENNqmFMlawhtrHg",
      },
    }
  `);
});

test("should fail to demote the last admin to a member", async () => {
  const createEvent = createChain(keyPairsA.sign, {
    [keyPairsA.sign.publicKey]: keyPairsA.box.publicKey,
  });
  const updateMemberEvent = updateMember(
    hashTransaction(createEvent.transaction),
    keyPairA,
    keyPairsA.sign.publicKey,
    { isAdmin: false, canAddMembers: false, canRemoveMembers: false }
  );
  const chain = [createEvent, updateMemberEvent];
  expect(() => resolveState(chain)).toThrow(InvalidTrustChainError);
  expect(() => resolveState(chain)).toThrow(
    "Not allowed to demote the last admin."
  );
});

test("should fail to demote an admin to a member if not more than 50% admins agree", async () => {
  const createEvent = createChain(keyPairsA.sign, {
    [keyPairsA.sign.publicKey]: keyPairsA.box.publicKey,
  });
  const addAdminEvent = addMember(
    hashTransaction(createEvent.transaction),
    keyPairA,
    keyPairsB.sign.publicKey,
    keyPairsB.box.publicKey,
    { isAdmin: true, canAddMembers: true, canRemoveMembers: true }
  );
  const updateMemberEvent = updateMember(
    hashTransaction(addAdminEvent.transaction),
    keyPairA,
    keyPairsB.sign.publicKey,
    { isAdmin: false, canAddMembers: false, canRemoveMembers: false }
  );
  const chain = [createEvent, addAdminEvent, updateMemberEvent];
  expect(() => resolveState(chain)).toThrow(InvalidTrustChainError);
  expect(() => resolveState(chain)).toThrow("Not allowed member update.");
});

test("should fail to promote an admin that is already an admin", async () => {
  const createEvent = createChain(keyPairsA.sign, {
    [keyPairsA.sign.publicKey]: keyPairsA.box.publicKey,
  });
  const addAdminEvent = addMember(
    hashTransaction(createEvent.transaction),
    keyPairA,
    keyPairsB.sign.publicKey,
    keyPairsB.box.publicKey,
    { isAdmin: true, canAddMembers: true, canRemoveMembers: true }
  );
  const updateMemberEvent = updateMember(
    hashTransaction(addAdminEvent.transaction),
    keyPairA,
    keyPairsB.sign.publicKey,
    { isAdmin: true, canAddMembers: true, canRemoveMembers: true }
  );
  const updateMemberEvent2 = addAuthorToEvent(updateMemberEvent, keyPairB);
  const chain = [createEvent, addAdminEvent, updateMemberEvent2];
  expect(() => resolveState(chain)).toThrow(InvalidTrustChainError);
  expect(() => resolveState(chain)).toThrow("Not allowed member update.");
});

test("should fail to update a member if nothing changes and canAddMembers and canRemoveMembers are false", async () => {
  const createEvent = createChain(keyPairsA.sign, {
    [keyPairsA.sign.publicKey]: keyPairsA.box.publicKey,
  });
  const addMemberEvent = addMember(
    hashTransaction(createEvent.transaction),
    keyPairA,
    keyPairsB.sign.publicKey,
    keyPairsB.box.publicKey,
    { isAdmin: false, canAddMembers: false, canRemoveMembers: false }
  );
  const updateMemberEvent = updateMember(
    hashTransaction(addMemberEvent.transaction),
    keyPairA,
    keyPairsB.sign.publicKey,
    { isAdmin: false, canAddMembers: false, canRemoveMembers: false }
  );
  const chain = [createEvent, addMemberEvent, updateMemberEvent];
  expect(() => resolveState(chain)).toThrow(InvalidTrustChainError);
  expect(() => resolveState(chain)).toThrow("Not allowed member update.");
});

test("should fail to update a member if nothing changes and canAddMembers and canRemoveMembers are true", async () => {
  const createEvent = createChain(keyPairsA.sign, {
    [keyPairsA.sign.publicKey]: keyPairsA.box.publicKey,
  });
  const addMemberEvent = addMember(
    hashTransaction(createEvent.transaction),
    keyPairA,
    keyPairsB.sign.publicKey,
    keyPairsB.box.publicKey,
    { isAdmin: false, canAddMembers: true, canRemoveMembers: true }
  );
  const updateMemberEvent = updateMember(
    hashTransaction(addMemberEvent.transaction),
    keyPairA,
    keyPairsB.sign.publicKey,
    { isAdmin: false, canAddMembers: true, canRemoveMembers: true }
  );
  const chain = [createEvent, addMemberEvent, updateMemberEvent];
  expect(() => resolveState(chain)).toThrow(InvalidTrustChainError);
  expect(() => resolveState(chain)).toThrow("Not allowed member update.");
});

test("should fail to update a member if nothing changes and canAddMembers is true and canRemoveMembers is false", async () => {
  const createEvent = createChain(keyPairsA.sign, {
    [keyPairsA.sign.publicKey]: keyPairsA.box.publicKey,
  });
  const addMemberEvent = addMember(
    hashTransaction(createEvent.transaction),
    keyPairA,
    keyPairsB.sign.publicKey,
    keyPairsB.box.publicKey,
    { isAdmin: false, canAddMembers: true, canRemoveMembers: false }
  );
  const updateMemberEvent = updateMember(
    hashTransaction(addMemberEvent.transaction),
    keyPairA,
    keyPairsB.sign.publicKey,
    { isAdmin: false, canAddMembers: true, canRemoveMembers: false }
  );
  const chain = [createEvent, addMemberEvent, updateMemberEvent];
  expect(() => resolveState(chain)).toThrow(InvalidTrustChainError);
  expect(() => resolveState(chain)).toThrow("Not allowed member update.");
});

test("should fail to update a member if nothing changes and canAddMembers is false and canRemoveMembers is true", async () => {
  const createEvent = createChain(keyPairsA.sign, {
    [keyPairsA.sign.publicKey]: keyPairsA.box.publicKey,
  });
  const addMemberEvent = addMember(
    hashTransaction(createEvent.transaction),
    keyPairA,
    keyPairsB.sign.publicKey,
    keyPairsB.box.publicKey,
    { isAdmin: false, canAddMembers: false, canRemoveMembers: true }
  );
  const updateMemberEvent = updateMember(
    hashTransaction(addMemberEvent.transaction),
    keyPairA,
    keyPairsB.sign.publicKey,
    { isAdmin: false, canAddMembers: false, canRemoveMembers: true }
  );
  const chain = [createEvent, addMemberEvent, updateMemberEvent];
  expect(() => resolveState(chain)).toThrow(InvalidTrustChainError);
  expect(() => resolveState(chain)).toThrow("Not allowed member update.");
});
