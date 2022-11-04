import sodium from "@serenity-tools/libsodium";
import { createSnapshotKey } from "./createSnapshotKey";

beforeAll(async () => {
  await sodium.ready;
});

test("create new snapshotKey", async () => {
  const kdfKey = "3NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto";
  const result = await createSnapshotKey({
    folderKey: kdfKey,
  });
  const { subkeyId, key } = result;
  expect(typeof subkeyId).toBe("number");
  expect(typeof key).toBe("string");
  expect(key.length).toBe(43);
});
