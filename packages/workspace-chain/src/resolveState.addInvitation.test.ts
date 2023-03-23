import sodium from "libsodium-wrappers";
import { addInvitation } from "./addInvitation";
import { InvalidTrustChainError } from "./errors";
import { addMember, createChain, resolveState } from "./index";
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
    invitationId: "invitationId",
    expiresAt: "2222-01-01T00:00:00.000Z",
    invitationInviterProof: "invitationInviterProof",
    role: "EDITOR",
  });
  const state = resolveState([createEvent, addInvitationEvent]);
  expect(state.invitations).toMatchInlineSnapshot(`
    {
      "invitationId": {
        "addedBy": [
          "74IPzs2dhoERLRuxeS7zadzEvKfb7IqOK-jKu0mQxIM",
        ],
        "expiresAt": "2222-01-01T00:00:00.000Z",
        "invitationInviterProof": "invitationInviterProof",
        "role": "EDITOR",
      },
    }
  `);
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
    invitationId: "invitationId",
    expiresAt: "2222-01-01T00:00:00.000Z",
    invitationInviterProof: "invitationInviterProof",
    role: "EDITOR",
  });
  const chain = [createEvent, addMemberEvent, addInvitationEvent];
  expect(() => resolveState(chain)).toThrow(InvalidTrustChainError);
  expect(() => resolveState(chain)).toThrow(
    "Not allowed to add an invitation."
  );
});
