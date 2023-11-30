import sodium from "react-native-libsodium";
import { kdfDeriveFromKey } from "./kdfDeriveFromKey";

beforeAll(async () => {
  await sodium.ready;
});

test("create new subkey", () => {
  const kdfKey = "3NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto";
  const result = kdfDeriveFromKey({ key: kdfKey, context: "doctitle" });
  const { subkeyId, key } = result;
  expect(typeof subkeyId).toBe("string");
  expect(typeof key).toBe("string");
  expect(key.length).toBe(43);
});

test("reconstruct subkey based on the existing subkeyId", () => {
  const kdfKey = "3NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto";
  const result = kdfDeriveFromKey({
    key: kdfKey,
    context: "comment_",
    subkeyId: "Am3wrVyg7xJC8X2Ky2OIyQ",
  });
  const { subkeyId, key } = result;
  expect(subkeyId).toBe("Am3wrVyg7xJC8X2Ky2OIyQ");
  expect(key).toBe("njOi5EjQ_W-64CX3-ugw8APgKq21pjgTs7QXeDJbpX8");
});

test("to throw in case of an unknown context", () => {
  const kdfKey = "3NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto";

  expect(() => {
    kdfDeriveFromKey({
      key: kdfKey,
      // @ts-expect-error
      context: "12345678",
      subkeyId: "Am3wrVyg7xJC8X2Ky2OIyQ",
    });
  }).toThrow();
});
