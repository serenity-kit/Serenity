import sodium from "@serenity-tools/libsodium";
import { createSnapshotKey } from "../createSnapshotKey/createSnapshotKey";
import { recreateSnapshotKey } from "./recreateSnapshotKey";

beforeAll(async () => {
  await sodium.ready;
});

test("recreate snapshotKey", async () => {
  const kdfKey = "3NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto";
  const snapshotKey = await createSnapshotKey({ folderKey: kdfKey });
  const result = await recreateSnapshotKey({
    folderKey: kdfKey,
    subkeyId: snapshotKey.subkeyId,
  });
  expect(result.key).toBe(snapshotKey.key);
});
