import sodium from "react-native-libsodium";
import { createDocumentKey } from "../createDocumentKey/createDocumentKey";
import { encryptDocumentTitle } from "./encryptDocumentTitle";

beforeAll(async () => {
  await sodium.ready;
});

test("encryptDocumentTitle", () => {
  const snapshotKey = "3NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto";
  const documentKey = createDocumentKey({ snapshotKey });
  const result = encryptDocumentTitle({
    key: documentKey.key,
    title: "Todos",
  });
  expect(typeof result.ciphertext).toBe("string");
  expect(typeof result.publicNonce).toBe("string");
});

test("encryptDocumentTitle with publicData", () => {
  const snapshotKey = "3NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto";
  const documentKey = createDocumentKey({ snapshotKey });
  const result = encryptDocumentTitle({
    key: documentKey.key,
    title: "Todos",
    publicData: { something: 2 },
  });
  expect(typeof result.ciphertext).toBe("string");
  expect(typeof result.publicNonce).toBe("string");
});

test("encryptDocumentTitle with publicData fails for invalid data", () => {
  const snapshotKey = "3NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto";
  const documentKey = createDocumentKey({ snapshotKey });
  expect(() =>
    encryptDocumentTitle({
      key: documentKey.key,
      title: "Todos",
      publicData: function foo() {},
    })
  ).toThrowError(/Invalid public data for encrypting the title\./);
});
