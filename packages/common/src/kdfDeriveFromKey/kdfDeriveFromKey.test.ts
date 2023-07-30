import sodium from "react-native-libsodium";
import { kdfDeriveFromKey } from "./kdfDeriveFromKey";

beforeAll(async () => {
  await sodium.ready;
});

test("create new subkey", () => {
  const kdfKey = "3NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto";
  const result = kdfDeriveFromKey({ key: kdfKey, context: "doctitle" });
  const { subkeyId, key } = result;
  expect(typeof subkeyId).toBe("number");
  expect(typeof key).toBe("string");
  expect(key.length).toBe(43);
});

test("reconstruct subkey based on the existing subkeyId", () => {
  const kdfKey = "3NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto";
  const result = kdfDeriveFromKey({
    key: kdfKey,
    context: "comment_",
    subkeyId: 5200022,
  });
  const { subkeyId, key } = result;
  expect(subkeyId).toBe(5200022);
  expect(key).toBe("iHr1pnaBwT889NrLdpD6KQBGP4fNTpqxetSb17UFGts");
});

test("to throw in case of an unknown context", () => {
  const kdfKey = "3NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto";

  expect(() => {
    kdfDeriveFromKey({
      key: kdfKey,
      // @ts-expect-error
      context: "12345678",
      subkeyId: 5200022,
    });
  }).toThrow();
});
