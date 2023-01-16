import sodium from "@serenity-tools/libsodium";
import { createDocumentKey } from "./createDocumentKey";

beforeAll(async () => {
  await sodium.ready;
});

test("create new documentKey", () => {
  const kdfKey = "3NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto";
  const result = createDocumentKey({
    folderKey: kdfKey,
  });
  const { subkeyId, key } = result;
  expect(typeof subkeyId).toBe("number");
  expect(typeof key).toBe("string");
  expect(key.length).toBe(43);
});
