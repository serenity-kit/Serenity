import sodium from "@serenity-tools/libsodium";
import { createDocumentKey } from "../createDocumentKey/createDocumentKey";
import { encryptDocumentTitle } from "./encryptDocumentTitle";

beforeAll(async () => {
  await sodium.ready;
});

test("encryptDocumentTitle", () => {
  const folderKey = "3NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto";
  const documentKey = createDocumentKey({ folderKey });
  const result = encryptDocumentTitle({
    key: documentKey.key,
    title: "Todos",
  });
  expect(typeof result.ciphertext).toBe("string");
  expect(typeof result.publicNonce).toBe("string");
});

test("encryptDocumentTitle with publicData", () => {
  const folderKey = "3NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto";
  const documentKey = createDocumentKey({ folderKey });
  const result = encryptDocumentTitle({
    key: documentKey.key,
    title: "Todos",
    publicData: { something: 2 },
  });
  expect(typeof result.ciphertext).toBe("string");
  expect(typeof result.publicNonce).toBe("string");
});

test("encryptDocumentTitle with publicData fails for invalid data", () => {
  const folderKey = "3NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto";
  const documentKey = createDocumentKey({ folderKey });
  expect(
    encryptDocumentTitle({
      key: documentKey.key,
      title: "Todos",
      publicData: function foo() {},
    })
  ).rejects.toThrowError(/Invalid public data for encrypting the title\./);
});
