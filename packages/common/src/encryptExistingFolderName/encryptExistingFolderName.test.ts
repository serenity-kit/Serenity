import sodium from "@serenity-tools/libsodium";
import { encryptExistingFolderName } from "./encryptExistingFolderName";

const kdfKey = "3NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto";
const subkeyId = 1286828569;

beforeAll(async () => {
  await sodium.ready;
});

test("encryptFolderName", async () => {
  const result = await encryptExistingFolderName({
    parentKey: kdfKey,
    subkeyId,
    name: "Getting started",
  });
  expect(typeof result.folderSubkey).toBe("string");
  expect(result.folderSubkey.length).toBe(43);
  expect(typeof result.folderSubkeyId).toBe("number");
  expect(typeof result.ciphertext).toBe("string");
  expect(typeof result.publicNonce).toBe("string");
});

test("encryptFolderName with publicData", async () => {
  const result = await encryptExistingFolderName({
    parentKey: kdfKey,
    name: "Getting started",
    subkeyId,
    publicData: { something: 4 },
  });
  expect(typeof result.ciphertext).toBe("string");
  expect(typeof result.publicNonce).toBe("string");
});

test("encryptFolderName with publicData fails for invalid publicData", async () => {
  await expect(
    (async () =>
      await encryptExistingFolderName({
        parentKey: kdfKey,
        name: "Getting started",
        subkeyId,
        publicData: function foo() {},
      }))()
  ).rejects.toThrowError(/Invalid public data for encrypting the name\./);
});
