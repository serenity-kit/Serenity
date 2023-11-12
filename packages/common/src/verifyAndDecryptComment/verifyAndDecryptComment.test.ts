import sodium from "react-native-libsodium";
import { createCommentKey } from "../createCommentKey/createCommentKey";
import { createDevice } from "../createDevice/createDevice";
import { encryptAndSignComment } from "../encryptAndSignComment/encryptAndSignComment";
import { recreateCommentKey } from "../recreateCommentKey/recreateCommentKey";
import { verifyAndDecryptComment } from "./verifyAndDecryptComment";

beforeAll(async () => {
  await sodium.ready;
});

test("successfully verifies and decrypts a comment", () => {
  const snapshotKey = "3NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto";
  const device = createDevice("user");
  const initialCommentKey = createCommentKey({ snapshotKey });
  const text = "Nice job";

  const result = encryptAndSignComment({
    key: initialCommentKey.key,
    text,
    from: { pos: 0 },
    to: { pos: 10 },
    device,
    documentId: "123",
    snapshotId: "456",
    subkeyId: initialCommentKey.subkeyId,
  });

  const commentKey = recreateCommentKey({
    snapshotKey,
    subkeyId: initialCommentKey.subkeyId,
  });
  const decryptedComment = verifyAndDecryptComment({
    key: commentKey.key,
    ciphertext: result.ciphertext,
    nonce: result.nonce,
    signature: result.signature,
    authorSigningPublicKey: device.signingPublicKey,
    commentId: result.commentId,
    documentId: "123",
    snapshotId: "456",
    subkeyId: commentKey.subkeyId,
  });

  expect(decryptedComment.text).toBe(text);
  expect(decryptedComment.from).toBeDefined();
  expect(decryptedComment.to).toBeDefined();
});
