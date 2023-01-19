// @ts-expect-error need the the .ts here to not import index.native.ts
import sodium from "./index.ts";

beforeAll(async () => {
  await sodium.ready;
});

test("crypto_kdf_keygen should create kdf key", () => {
  const result = sodium.crypto_kdf_keygen();
  expect([...result].length).toEqual(43);
});
