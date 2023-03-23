import sodium from "react-native-libsodium";
import { createDocumentTitleKey } from "../createDocumentTitleKey/createDocumentTitleKey";
import { recreateDocumentTitleKey } from "./recreateDocumentTitleKey";

beforeAll(async () => {
  await sodium.ready;
});

test("recreate documentTitleKey", () => {
  const kdfKey = "3NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto";
  const documentTitleKey = createDocumentTitleKey({ snapshotKey: kdfKey });
  const result = recreateDocumentTitleKey({
    snapshotKey: kdfKey,
    subkeyId: documentTitleKey.subkeyId,
  });
  expect(result.key).toBe(documentTitleKey.key);
});
