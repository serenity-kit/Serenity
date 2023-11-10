import sodium from "react-native-libsodium";
import { createCommentKey } from "../createCommentKey/createCommentKey";
import { createDevice } from "../createDevice/createDevice";
import { encryptAndSignComment } from "../encryptAndSignComment/encryptAndSignComment";
import { verifyCommentSignature } from "./verifyCommentSignature";

beforeAll(async () => {
  await sodium.ready;
});

test("verify comment signature", () => {
  const device = createDevice("user");
  const snapshotKey = "3NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto";
  const commentKey = createCommentKey({ snapshotKey });
  const result = encryptAndSignComment({
    key: commentKey.key,
    text: "Nice job",
    from: 0,
    to: 10,
    device,
    documentId: "123",
    snapshotId: "456",
    subkeyId: commentKey.subkeyId,
  });
  const verified = verifyCommentSignature({
    ciphertext: result.ciphertext,
    nonce: result.nonce,
    signature: result.signature,
    authorSigningPublicKey: device.signingPublicKey,
  });
  expect(verified).toBe(true);
});
