import sodium from "react-native-libsodium";
import { createCommentKey } from "../createCommentKey/createCommentKey";
import { createDevice } from "../createDevice/createDevice";
import { encryptAndSignComment } from "./encryptAndSignComment";

beforeAll(async () => {
  await sodium.ready;
});

test("encrypt comment", () => {
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
    workspaceMemberDevicesProof: {
      clock: 0,
      hash: "abc",
      hashSignature: "abc",
      version: 0,
    },
  });
  expect(typeof result.ciphertext).toBe("string");
  expect(typeof result.nonce).toBe("string");
  expect(typeof result.commentId).toBe("string");
  expect(typeof result.signature).toBe("string");
});
