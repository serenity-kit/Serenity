import sodium from "react-native-libsodium";
import { createSnapshotKey } from "../createSnapshotKey/createSnapshotKey";
import { recreateSnapshotKey } from "./recreateSnapshotKey";

beforeAll(async () => {
  await sodium.ready;
});

test("recreate snapshotKey", () => {
  const kdfKey = "3NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto";
  const snapshotKey = createSnapshotKey({ folderKey: kdfKey });
  const result = recreateSnapshotKey({
    folderKey: kdfKey,
    subkeyId: snapshotKey.subkeyId,
  });
  expect(result.key).toBe(snapshotKey.key);
});
