import sodium from "react-native-libsodium";
import { createCommentKey } from "./createCommentKey";

beforeAll(async () => {
  await sodium.ready;
});

test("create new commentKey", () => {
  const kdfKey = "3NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto";
  const result = createCommentKey({
    documentNameKey: kdfKey,
  });
  const { subkeyId, key } = result;
  expect(typeof subkeyId).toBe("number");
  expect(typeof key).toBe("string");
  expect(key.length).toBe(43);
});
