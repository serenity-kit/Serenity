import sodium from "react-native-libsodium";
import { createDocumentTitleKey } from "./createDocumentTitleKey";

beforeAll(async () => {
  await sodium.ready;
});

test("create new documentTitleKey", () => {
  const kdfKey = "3NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto";
  const result = createDocumentTitleKey({
    snapshotKey: kdfKey,
  });
  const { subkeyId, key } = result;
  expect(typeof subkeyId).toBe("number");
  expect(typeof key).toBe("string");
  expect(key.length).toBe(43);
});
