import sodium from "react-native-libsodium";
import {
  getKeyPairB,
  getKeyPairsA,
  getKeyPairsB,
  getKeyPairsC,
  KeyPairs,
} from "../test/testUtils";
import { addAuthorToEvent } from "./addAuthorToEvent";
import { InvalidTrustChainError } from "./errors";
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
  const event = createChain(keyPairsA.sign, {
    [keyPairsA.sign.publicKey]: keyPairsA.box.publicKey,
  });
  const state = resolveState([event]);
  expect(state.members).toMatchInlineSnapshot(`
    {
      "74IPzs2dhoERLRuxeS7zadzEvKfb7IqOK-jKu0mQxIM": {
        "addedBy": [
          "74IPzs2dhoERLRuxeS7zadzEvKfb7IqOK-jKu0mQxIM",
        ],
        "lockboxPublicKey": "wevxDsZ-L7wpy3ePZcQNfG8WDh0wB0d27phr5OMdLwI",
        "role": "ADMIN",
      },
    }
  `);
});

test("should resolve to two admins after creating a chain with two authors", async () => {
  const event = createChain(keyPairsA.sign, {
    [keyPairsA.sign.publicKey]: keyPairsA.box.publicKey,
    [keyPairsB.sign.publicKey]: keyPairsB.box.publicKey,
  });
  const event2 = addAuthorToEvent(event, keyPairB);
  const state = resolveState([event2]);
  expect(state.members).toMatchInlineSnapshot(`
    {
      "74IPzs2dhoERLRuxeS7zadzEvKfb7IqOK-jKu0mQxIM": {
        "addedBy": [
          "74IPzs2dhoERLRuxeS7zadzEvKfb7IqOK-jKu0mQxIM",
          "MTDhqVIMflTD0Car-KSP1MWCIEYqs2LBaXfU20di0tY",
        ],
        "lockboxPublicKey": "wevxDsZ-L7wpy3ePZcQNfG8WDh0wB0d27phr5OMdLwI",
        "role": "ADMIN",
      },
      "MTDhqVIMflTD0Car-KSP1MWCIEYqs2LBaXfU20di0tY": {
        "addedBy": [
          "74IPzs2dhoERLRuxeS7zadzEvKfb7IqOK-jKu0mQxIM",
          "MTDhqVIMflTD0Car-KSP1MWCIEYqs2LBaXfU20di0tY",
        ],
        "lockboxPublicKey": "b_skeL8qudNQji-HuOldPNFDzYSBENNqmFMlawhtrHg",
        "role": "ADMIN",
      },
    }
  `);
});

test("should fail in case there are more authors than declared admins", async () => {
  const event = createChain(keyPairsA.sign, {
    [keyPairsA.sign.publicKey]: keyPairsA.box.publicKey,
  });
  const event2 = addAuthorToEvent(event, keyPairB);
  const chain = [event2];
  expect(() => resolveState(chain)).toThrow(InvalidTrustChainError);
  expect(() => resolveState(chain)).toThrow("Invalid chain creation event.");
});

test("should fail in case the authors and declared admins don't match up", async () => {
  const event = createChain(keyPairsA.sign, {
    [keyPairsA.sign.publicKey]: keyPairsA.box.publicKey,
    [keyPairsC.sign.publicKey]: keyPairsC.box.publicKey,
  });
  const event2 = addAuthorToEvent(event, keyPairB);
  const chain = [event2];
  expect(() => resolveState(chain)).toThrow(InvalidTrustChainError);
  expect(() => resolveState(chain)).toThrow("Invalid chain creation event.");
});
