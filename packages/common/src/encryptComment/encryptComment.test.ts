import sodium from "react-native-libsodium";
import { createCommentKey } from "../createCommentKey/createCommentKey";
import { encryptComment } from "./encryptComment";

beforeAll(async () => {
  await sodium.ready;
});

test("documentNameKey", () => {
  const documentNameKey = "3NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto";
  const commentKey = createCommentKey({ documentNameKey });
  const result = encryptComment({
    key: commentKey.key,
    comment: "Nice job",
  });
  expect(typeof result.ciphertext).toBe("string");
  expect(typeof result.publicNonce).toBe("string");
});

test("documentNameKey with publicData", () => {
  const documentNameKey = "3NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto";
  const commentKey = createCommentKey({ documentNameKey });
  const result = encryptComment({
    key: commentKey.key,
    comment: "Nice job",
    publicData: { something: 2 },
  });
  expect(typeof result.ciphertext).toBe("string");
  expect(typeof result.publicNonce).toBe("string");
});

test("encryptComment with publicData fails for invalid data", () => {
  const documentNameKey = "3NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto";
  const commentKey = createCommentKey({ documentNameKey });
  expect(() =>
    encryptComment({
      key: commentKey.key,
      comment: "Nice job",
      publicData: function foo() {},
    })
  ).toThrowError(/Invalid public data for encrypting the title\./);
});
