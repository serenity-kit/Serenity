import sodium from "react-native-libsodium";
import { createDocumentKey } from "../createDocumentKey/createDocumentKey";
import { encryptDocumentTitle } from "../encryptDocumentTitle/encryptDocumentTitle";
import { recreateDocumentKey } from "../recreateDocumentKey/recreateDocumentKey";
import { decryptDocumentTitle } from "./decryptDocumentTitle";

beforeAll(async () => {
  await sodium.ready;
});

test("decryptDocumentTitle", async () => {
  const folderKey = "3NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto";
  const initialDocumentKey = createDocumentKey({ folderKey });
  const result = encryptDocumentTitle({
    key: initialDocumentKey.key,
    title: "Todos",
  });

  const documentKey = recreateDocumentKey({
    folderKey,
    subkeyId: initialDocumentKey.subkeyId,
  });
  const documentTitle = await decryptDocumentTitle({
    key: documentKey.key,
    ciphertext: result.ciphertext,
    publicNonce: result.publicNonce,
    publicData: result.publicData,
  });

  expect(documentTitle).toBe("Todos");
});

test("decryptDocumentTitle fails for wrong key", async () => {
  const folderKey = "3NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto";
  const initialDocumentKey = createDocumentKey({ folderKey });
  const result = encryptDocumentTitle({
    key: initialDocumentKey.key,
    title: "Todos",
  });

  const documentKey = recreateDocumentKey({
    folderKey,
    subkeyId: initialDocumentKey.subkeyId,
  });

  await expect(
    (async () =>
      await decryptDocumentTitle({
        key: "0000" + documentKey.key.substring(4),
        ciphertext: result.ciphertext,
        publicNonce: result.publicNonce,
        publicData: result.publicData,
      }))()
  ).rejects.toThrowError(/ciphertext cannot be decrypted using that key/);
});

test("decryptDocumentTitle fails for wrong publicData", async () => {
  const folderKey = "3NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto";
  const initialDocumentKey = createDocumentKey({ folderKey });
  const result = encryptDocumentTitle({
    key: initialDocumentKey.key,
    title: "Todos",
  });

  const documentKey = recreateDocumentKey({
    folderKey,
    subkeyId: initialDocumentKey.subkeyId,
  });

  await expect(
    (async () =>
      await decryptDocumentTitle({
        key: documentKey.key,
        ciphertext: result.ciphertext,
        publicNonce: result.publicNonce,
        publicData: { something: 4 },
      }))()
  ).rejects.toThrowError(/ciphertext cannot be decrypted using that key/);
});

test("decryptDocumentTitle fails for invalid publicData", async () => {
  const folderKey = "3NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto";
  const initialDocumentKey = createDocumentKey({ folderKey });
  const result = encryptDocumentTitle({
    key: initialDocumentKey.key,
    title: "Todos",
  });

  const documentKey = recreateDocumentKey({
    folderKey,
    subkeyId: initialDocumentKey.subkeyId,
  });

  await expect(
    (async () =>
      await decryptDocumentTitle({
        key: documentKey.key,
        ciphertext: result.ciphertext,
        publicNonce: result.publicNonce,
        publicData: function foo() {},
      }))()
  ).rejects.toThrowError(/Invalid public data for decrypting the document\./);
});
