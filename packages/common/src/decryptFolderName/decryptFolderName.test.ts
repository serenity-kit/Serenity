import sodium from "react-native-libsodium";
import { encryptFolderName } from "../encryptFolderName/encryptFolderName";
import { createSubkeyId } from "../kdfDeriveFromKey/kdfDeriveFromKey";
import { decryptFolderName } from "./decryptFolderName";

const kdfKey = "3NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto";

beforeAll(async () => {
  await sodium.ready;
});

test("decryptFolderName", () => {
  const subkeyId = createSubkeyId();
  const result = encryptFolderName({
    parentKey: kdfKey,
    name: "Getting started",
    folderId: "abc",
    subkeyId,
    workspaceId: "xyz",
    keyDerivationTrace: {
      workspaceKeyId: "workspaceKey",
      trace: [],
    },
  });
  const decryptFolderResult = decryptFolderName({
    parentKey: kdfKey,
    ciphertext: result.ciphertext,
    nonce: result.nonce,
    subkeyId: result.folderSubkeyId,
    folderId: "abc",
    workspaceId: "xyz",
    keyDerivationTrace: {
      workspaceKeyId: "workspaceKey",
      trace: [],
    },
  });
  expect(decryptFolderResult).toBe("Getting started");
});

test("decryptFolderName with publicData fails for wrong key", () => {
  const subkeyId = createSubkeyId();
  const result = encryptFolderName({
    parentKey: kdfKey,
    name: "Getting started",
    folderId: "abc",
    subkeyId,
    workspaceId: "xyz",
    keyDerivationTrace: {
      workspaceKeyId: "workspaceKey",
      trace: [],
    },
  });
  expect(() =>
    decryptFolderName({
      parentKey: "4NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto",
      ciphertext: result.ciphertext,
      nonce: result.nonce,
      subkeyId: result.folderSubkeyId,
      folderId: "abc",
      workspaceId: "xyz",
      keyDerivationTrace: {
        workspaceKeyId: "workspaceKey",
        trace: [],
      },
    })
  ).toThrowError(/ciphertext cannot be decrypted using that key/);
});

test("decryptFolderName with publicData fails for wrong public data", () => {
  const subkeyId = createSubkeyId();
  const result = encryptFolderName({
    parentKey: kdfKey,
    name: "Getting started",
    folderId: "abc",
    subkeyId,
    workspaceId: "xyz",
    keyDerivationTrace: {
      workspaceKeyId: "workspaceKey",
      trace: [],
    },
  });
  expect(() =>
    decryptFolderName({
      parentKey: kdfKey,
      ciphertext: result.ciphertext,
      nonce: result.nonce,
      subkeyId: result.folderSubkeyId,
      folderId: "WRONG",
      workspaceId: "xyz",
      keyDerivationTrace: {
        workspaceKeyId: "workspaceKey",
        trace: [],
      },
    })
  ).toThrowError(/ciphertext cannot be decrypted using that key/);
});
