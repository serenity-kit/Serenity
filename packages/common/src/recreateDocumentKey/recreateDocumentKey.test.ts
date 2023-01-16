import sodium from "@serenity-tools/libsodium";
import { createDocumentKey } from "../createDocumentKey/createDocumentKey";
import { recreateDocumentKey } from "./recreateDocumentKey";

beforeAll(async () => {
  await sodium.ready;
});

test("recreate documentKey", () => {
  const kdfKey = "3NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto";
  const documentKey = createDocumentKey({ folderKey: kdfKey });
  const result = recreateDocumentKey({
    folderKey: kdfKey,
    subkeyId: documentKey.subkeyId,
  });
  expect(result.key).toBe(documentKey.key);
});
