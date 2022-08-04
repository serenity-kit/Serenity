import sodium from "@serenity-tools/libsodium";
import { createFolderKey } from "./createFolderKey";

beforeAll(async () => {
  await sodium.ready;
});

test("createFolderKey", async () => {
  const kdfKey = "3NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto";
  const result = await createFolderKey(kdfKey);
  const { subkeyId, key } = result;
  expect(typeof subkeyId).toBe("number");
  expect(typeof key).toBe("string");
  expect(key.length).toBe(43);
});
