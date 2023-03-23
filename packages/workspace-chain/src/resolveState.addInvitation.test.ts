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
    expiresAt: new Date(),
    role: "EDITOR",
  });
  const state = resolveState([createEvent, addInvitationEvent]);
  expect(state.invitations).toMatchInlineSnapshot(`
    {
      "n5UCejsuWTcBksSnT4BsP6BV12WivoFN": {
        "addedBy": [
          "74IPzs2dhoERLRuxeS7zadzEvKfb7IqOK-jKu0mQxIM",
        ],
        "expiresAt": "2023-03-23T19:53:36.158Z",
        "invitationDataSignature": "FIw6NSxHdd0Ev0ZjXa7FLjfyEEW8-Rm_Y0eQ1Cq1-rQkCW4kMwlOhcn897dTcimsZkhfoNRQFjkdXRqsJ9MUAA",
        "invitationSigningPublicKey": "fRHmz6wRU4BrVv4QX260UC97_yLqcJo1V80cI27lbxE",
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
    expiresAt: new Date(),
    role: "EDITOR",
  });
  const chain = [createEvent, addMemberEvent, addInvitationEvent];
  expect(() => resolveState(chain)).toThrow(InvalidTrustChainError);
  expect(() => resolveState(chain)).toThrow(
    "Not allowed to add an invitation."
  );
});
