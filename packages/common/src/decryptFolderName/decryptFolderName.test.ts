import sodium from "@serenity-tools/libsodium";
import { encryptFolderName } from "../encryptFolderName/encryptFolderName";
import { decryptFolderName } from "./decryptFolderName";

const kdfKey = "3NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto";

beforeAll(async () => {
  await sodium.ready;
});

test("decryptFolderName", () => {
  const result = encryptFolderName({
    parentKey: kdfKey,
    name: "Getting started",
  });
  const decryptFolderResult = decryptFolderName({
    parentKey: kdfKey,
    ciphertext: result.ciphertext,
    publicNonce: result.publicNonce,
    subkeyId: result.folderSubkeyId,
    publicData: result.publicData,
  });
  expect(decryptFolderResult).toBe("Getting started");
});

test("decryptFolderName with publicData fails for wrong key", () => {
  const result = encryptFolderName({
    parentKey: kdfKey,
    name: "Getting started",
  });
  expect(
    decryptFolderName({
      parentKey: "4NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto",
      ciphertext: result.ciphertext,
      publicNonce: result.publicNonce,
      subkeyId: result.folderSubkeyId,
      publicData: result.publicData,
    })
  ).rejects.toThrowError(/ciphertext cannot be decrypted using that key/);
});

test("decryptFolderName with publicData fails for wrong public data", () => {
  const result = encryptFolderName({
    parentKey: kdfKey,
    name: "Getting started",
  });
  expect(
    decryptFolderName({
      parentKey: kdfKey,
      ciphertext: result.ciphertext,
      publicNonce: result.publicNonce,
      subkeyId: result.folderSubkeyId,
      publicData: { something: 4 },
    })
  ).rejects.toThrowError(/ciphertext cannot be decrypted using that key/);
});

test("decryptFolderName with publicData fails for invalid publicData", () => {
  const result = encryptFolderName({
    parentKey: kdfKey,
    name: "Getting started",
  });
  expect(
    decryptFolderName({
      parentKey: kdfKey,
      ciphertext: result.ciphertext,
      publicNonce: result.publicNonce,
      subkeyId: result.folderSubkeyId,
      publicData: function foo() {},
    })
  ).rejects.toThrowError(/Invalid public data for decrypting the folder\./);
});
