import sodium from "@serenity-tools/libsodium";
import { encryptFolder } from "./encryptFolder";

beforeAll(async () => {
  await sodium.ready;
});

test("encryptFolder", async () => {
  const kdfKey = "3NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto";
  const result = await encryptFolder({
    parentKey: kdfKey,
    name: "Getting started",
  });
  expect(typeof result.folderSubKey).toBe("string");
  expect(result.folderSubKey.length).toBe(43);
  expect(typeof result.folderSubkeyId).toBe("number");
  expect(typeof result.ciphertext).toBe("string");
  expect(typeof result.publicNonce).toBe("string");
});
