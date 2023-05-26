import sodium from "react-native-libsodium";
import {
  getKeyPairB,
  getKeyPairsA,
  getKeyPairsB,
  getKeyPairsC,
  KeyPairs,
} from "../test/testUtils";
import { addAuthorToEvent } from "./addAuthorToEvent";
import { InvalidWorkspaceChainError } from "./errors";
import { createChain, resolveState } from "./index";

let keyPairsA: KeyPairs;
let keyPairB: sodium.KeyPair;
let keyPairsB: KeyPairs;
let keyPairsC: KeyPairs;

beforeAll(async () => {
  await sodium.ready;
  keyPairsA = getKeyPairsA();
  keyPairB = getKeyPairB();
  keyPairsB = getKeyPairsB();
  keyPairsC = getKeyPairsC();

  // const newKeyPair = sodium.crypto_sign_keypair();
  // console.log("privateKey: ", sodium.to_base64(newKeyPair.privateKey));
  // console.log("publicKey: ", sodium.to_base64(newKeyPair.publicKey));
});

test("should resolve to one admin after creating a chain", async () => {
  const event = createChain(keyPairsA.sign);
  const state = resolveState([event]);
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

test("should fail in case there is more than one author", async () => {
  const event = createChain(keyPairsA.sign);
  const event2 = addAuthorToEvent(event, keyPairB);
  const chain = [event2];
  expect(() => resolveState(chain)).toThrow(InvalidWorkspaceChainError);
  expect(() => resolveState(chain)).toThrow("Invalid chain creation event.");
});
