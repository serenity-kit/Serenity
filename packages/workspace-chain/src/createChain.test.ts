import sodium from "react-native-libsodium";
import { getKeyPairsA, KeyPairs } from "../test/testUtils";
import { createChain } from "./index";
import { isValidCreateChainEvent } from "./utils";

let keyPairsA: KeyPairs;

beforeAll(async () => {
  await sodium.ready;
  keyPairsA = getKeyPairsA();
});

test("should create a new chain event", async () => {
  const event = createChain(keyPairsA.sign, {
    [keyPairsA.sign.publicKey]: keyPairsA.box.publicKey,
  });
  expect(event.prevHash).toBeNull();
  expect(isValidCreateChainEvent(event)).toBe(true);
});
