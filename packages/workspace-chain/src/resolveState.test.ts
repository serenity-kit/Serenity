import sodium from "libsodium-wrappers";
import { InvalidTrustChainError } from "./errors";
import { addMember, createChain, resolveState } from "./index";
import {
  getKeyPairA,
  getKeyPairB,
  getKeyPairsA,
  getKeyPairsB,
  getKeyPairsC,
  KeyPairs,
} from "./testUtils";
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

test("should fail in case the chain is not correctly ordered", async () => {
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
    "ADMIN"
  );
  const chain = [createEvent, addMemberEvent2, addMemberEvent];
  expect(() => resolveState(chain)).toThrow(InvalidTrustChainError);
  expect(() => resolveState(chain)).toThrow(
    "Invalid signature for MTDhqVIMflTD0Car-KSP1MWCIEYqs2LBaXfU20di0tY."
  );
});
