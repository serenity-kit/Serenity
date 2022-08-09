import sodium from "@serenity-tools/libsodium";
import { encryptFolder } from "../encryptFolder/encryptFolder";
import { decryptFolder } from "./decryptFolder";

const kdfKey = "3NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto";

beforeAll(async () => {
  await sodium.ready;
});

test("decryptFolder", async () => {
  const result = await encryptFolder({
    parentKey: kdfKey,
    name: "Getting started",
  });
  const decryptFolderResult = await decryptFolder({
    parentKey: kdfKey,
    ciphertext: result.ciphertext,
    publicNonce: result.publicNonce,
    subkeyId: result.folderSubkeyId,
    publicData: result.publicData,
  });
  expect(decryptFolderResult).toBe("Getting started");
});

test("decryptFolder with publicData fails for wrong key", async () => {
  const result = await encryptFolder({
    parentKey: kdfKey,
    name: "Getting started",
  });
  await expect(
    (async () =>
      await decryptFolder({
        parentKey: "4NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto",
        ciphertext: result.ciphertext,
        publicNonce: result.publicNonce,
        subkeyId: result.folderSubkeyId,
        publicData: result.publicData,
      }))()
  ).rejects.toThrowError(/ciphertext cannot be decrypted using that key/);
});

test("decryptFolder with publicData fails for wrong public data", async () => {
  const result = await encryptFolder({
    parentKey: kdfKey,
    name: "Getting started",
  });
  await expect(
    (async () =>
      await decryptFolder({
        parentKey: kdfKey,
        ciphertext: result.ciphertext,
        publicNonce: result.publicNonce,
        subkeyId: result.folderSubkeyId,
        publicData: { something: 4 },
      }))()
  ).rejects.toThrowError(/ciphertext cannot be decrypted using that key/);
});

test("decryptFolder with publicData fails for invalid publicData", async () => {
  const result = await encryptFolder({
    parentKey: kdfKey,
    name: "Getting started",
  });
  await expect(
    (async () =>
      await decryptFolder({
        parentKey: kdfKey,
        ciphertext: result.ciphertext,
        publicNonce: result.publicNonce,
        subkeyId: result.folderSubkeyId,
        publicData: function foo() {},
      }))()
  ).rejects.toThrowError(/Invalid public data for decrypting the folder\./);
});
