import sodium from "@serenity-tools/libsodium";
import { createDocumentKey } from "../createDocumentKey/createDocumentKey";
import { encryptDocumentTitle } from "./encryptDocumentTitle";

beforeAll(async () => {
  await sodium.ready;
});

test("encryptDocumentTitle", async () => {
  const folderKey = "3NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto";
  const documentKey = await createDocumentKey({ folderKey });
  const result = await encryptDocumentTitle({
    key: documentKey.key,
    title: "Todos",
  });
  expect(typeof result.ciphertext).toBe("string");
  expect(typeof result.publicNonce).toBe("string");
});

test("encryptDocumentTitle with publicData", async () => {
  const folderKey = "3NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto";
  const documentKey = await createDocumentKey({ folderKey });
  const result = await encryptDocumentTitle({
    key: documentKey.key,
    title: "Todos",
    publicData: { something: 2 },
  });
  expect(typeof result.ciphertext).toBe("string");
  expect(typeof result.publicNonce).toBe("string");
});

test("encryptDocumentTitle with publicData fails for invalid data", async () => {
  const folderKey = "3NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto";
  const documentKey = await createDocumentKey({ folderKey });
  await expect(
    (async () =>
      await encryptDocumentTitle({
        key: documentKey.key,
        title: "Todos",
        publicData: function foo() {},
      }))()
  ).rejects.toThrowError(/Invalid public data for encrypting the title\./);
});
