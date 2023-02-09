import sodium from "react-native-libsodium";
import { createCommentKey } from "../createCommentKey/createCommentKey";
import { encryptComment } from "../encryptComment/encryptComment";
import { encryptDocumentTitle } from "../encryptDocumentTitle/encryptDocumentTitle";
import { recreateCommentKey } from "../recreateCommentKey/recreateCommentKey";
import { decryptComment } from "./decryptComment";

beforeAll(async () => {
  await sodium.ready;
});

test("decryptDocumentTitle", () => {
  const documentNameKey = "3NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto";
  const initialCommentKey = createCommentKey({ documentNameKey });
  const comment = "Nice job";
  const result = encryptComment({
    key: initialCommentKey.key,
    comment,
  });

  const documentKey = recreateCommentKey({
    documentNameKey,
    subkeyId: initialCommentKey.subkeyId,
  });
  const decryptedComment = decryptComment({
    key: documentKey.key,
    ciphertext: result.ciphertext,
    publicNonce: result.publicNonce,
    publicData: result.publicData,
  });

  expect(decryptedComment).toBe(comment);
});

test("decryptDocumentTitle fails for wrong key", () => {
  const documentNameKey = "3NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto";
  const initialCommentKey = createCommentKey({ documentNameKey });
  const comment = "Nice job";
  const result = encryptComment({
    key: initialCommentKey.key,
    comment,
  });

  const documentKey = recreateCommentKey({
    documentNameKey,
    subkeyId: initialCommentKey.subkeyId,
  });

  expect(() =>
    decryptComment({
      key: "0000" + documentKey.key.substring(4),
      ciphertext: result.ciphertext,
      publicNonce: result.publicNonce,
      publicData: result.publicData,
    })
  ).toThrowError(/ciphertext cannot be decrypted using that key/);
});

test("decryptComment fails for wrong publicData", () => {
  const documentNameKey = "3NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto";
  const initialCommentKey = createCommentKey({ documentNameKey });
  const result = encryptDocumentTitle({
    key: initialCommentKey.key,
    title: "Todos",
  });

  const documentKey = recreateCommentKey({
    documentNameKey,
    subkeyId: initialCommentKey.subkeyId,
  });

  expect(() =>
    decryptComment({
      key: documentKey.key,
      ciphertext: result.ciphertext,
      publicNonce: result.publicNonce,
      publicData: { something: 4 },
    })
  ).toThrowError(/ciphertext cannot be decrypted using that key/);
});

test("decryptComment fails for invalid publicData", () => {
  const documentNameKey = "3NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto";
  const initialCommentKey = createCommentKey({ documentNameKey });
  const result = encryptDocumentTitle({
    key: initialCommentKey.key,
    title: "Todos",
  });

  const documentKey = recreateCommentKey({
    documentNameKey,
    subkeyId: initialCommentKey.subkeyId,
  });

  expect(() =>
    decryptComment({
      key: documentKey.key,
      ciphertext: result.ciphertext,
      publicNonce: result.publicNonce,
      publicData: function foo() {},
    })
  ).toThrowError(/Invalid public data for decrypting the document\./);
});
