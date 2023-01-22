import sodium from "react-native-libsodium";
import { createDocumentKey } from "../createDocumentKey/createDocumentKey";
import { encryptDocumentTitle } from "../encryptDocumentTitle/encryptDocumentTitle";
import { recreateDocumentKey } from "../recreateDocumentKey/recreateDocumentKey";
import { decryptDocumentTitle } from "./decryptDocumentTitle";

beforeAll(async () => {
  await sodium.ready;
});

test("decryptDocumentTitle", () => {
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
  const documentTitle = decryptDocumentTitle({
    key: documentKey.key,
    ciphertext: result.ciphertext,
    publicNonce: result.publicNonce,
    publicData: result.publicData,
  });

  expect(documentTitle).toBe("Todos");
});

test("decryptDocumentTitle fails for wrong key", () => {
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

  expect(() =>
    decryptDocumentTitle({
      key: "0000" + documentKey.key.substring(4),
      ciphertext: result.ciphertext,
      publicNonce: result.publicNonce,
      publicData: result.publicData,
    })
  ).toThrowError(/ciphertext cannot be decrypted using that key/);
});

test("decryptDocumentTitle fails for wrong publicData", () => {
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

  expect(() =>
    decryptDocumentTitle({
      key: documentKey.key,
      ciphertext: result.ciphertext,
      publicNonce: result.publicNonce,
      publicData: { something: 4 },
    })
  ).toThrowError(/ciphertext cannot be decrypted using that key/);
});

test("decryptDocumentTitle fails for invalid publicData", () => {
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

  expect(() =>
    decryptDocumentTitle({
      key: documentKey.key,
      ciphertext: result.ciphertext,
      publicNonce: result.publicNonce,
      publicData: function foo() {},
    })
  ).toThrowError(/Invalid public data for decrypting the document\./);
});
