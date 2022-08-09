import sodium from "@serenity-tools/libsodium";
import { kdfDeriveFromKey } from "./kdfDeriveFromKey";

beforeAll(async () => {
  await sodium.ready;
});

test("create new subkey", async () => {
  const kdfKey = "3NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto";
  const result = await kdfDeriveFromKey({ key: kdfKey, context: "serenity" });
  const { subkeyId, key } = result;
  expect(typeof subkeyId).toBe("number");
  expect(typeof key).toBe("string");
  expect(key.length).toBe(43);
});

test("reconstruct subkey based on the existing subkeyId", async () => {
  const kdfKey = "3NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto";
  const result = await kdfDeriveFromKey({
    key: kdfKey,
    context: "serenity",
    subkeyId: 5200022,
  });
  const { subkeyId, key } = result;
  expect(subkeyId).toBe(5200022);
  expect(key).toBe("R2ycEA9jEapG3MEAM3VEgYsKgiwkMm_JuwqbtfE13F4");
});
