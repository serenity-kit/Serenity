// @ts-expect-error need the the .ts here to not import index.native.ts
import sodium from "./index.ts";

beforeAll(async () => {
  await sodium.ready;
});

test("crypto_kdf_keygen should create kdf key", async () => {
  const result = await sodium.crypto_kdf_keygen();
  expect([...result].length).toEqual(43);
});

test("crypto_kdf_derive_from_key should derive key from a kdf key", async () => {
  const kdfKey = "3NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto";
  const derivedKey = await sodium.crypto_kdf_derive_from_key(
    22,
    0,
    "testtest",
    kdfKey
  );

  expect(derivedKey).toEqual("gxtnpWSajkqBp6MIaEYPXPIAV0HGMQ");
});

test("crypto_kdf_derive_from_key should throw an error if context is not 8 chars long", async () => {
  const kdfKey = "3NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto";
  await expect(
    (async () =>
      await sodium.crypto_kdf_derive_from_key(22, 0, "testtestt", kdfKey))()
  ).rejects.toThrowError(/crypto_kdf_derive_from_key context must be 8 bytes/);
  await expect(
    (async () =>
      await sodium.crypto_kdf_derive_from_key(22, 0, "test", kdfKey))()
  ).rejects.toThrowError(/crypto_kdf_derive_from_key context must be 8 bytes/);
});
