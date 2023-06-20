import sodium from "react-native-libsodium";
import { KeyPairs, getKeyPairsA } from "../test/testUtils";
import { assertAuthorOfEvent } from "./assertAuthorOfEvent";
import { createChain } from "./createChain";
import { InvalidAuthorWorkspaceChainError } from "./errors";

let keyPairsA: KeyPairs;

beforeAll(async () => {
  await sodium.ready;
  keyPairsA = getKeyPairsA();
});

it("should not throw an error if the signingPublicKey is found among the authors", () => {
  const event = createChain(keyPairsA.sign);
  expect(() =>
    assertAuthorOfEvent(event, keyPairsA.sign.publicKey)
  ).not.toThrow();
});

it("should throw an InvalidAuthorWorkspaceChainError if the signingPublicKey is not found among the authors", () => {
  const event = createChain(keyPairsA.sign);
  expect(() => assertAuthorOfEvent(event, "something")).toThrow(
    InvalidAuthorWorkspaceChainError
  );
  expect(() => assertAuthorOfEvent(event, "something")).toThrow(
    "Not an author of the event"
  );
});
