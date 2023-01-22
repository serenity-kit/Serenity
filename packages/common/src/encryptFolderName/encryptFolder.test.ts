import sodium from "react-native-libsodium";
import { encryptFolderName } from "./encryptFolderName";

const kdfKey = "3NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto";

beforeAll(async () => {
  await sodium.ready;
});

test("encryptFolderName", () => {
  const result = encryptFolderName({
    parentKey: kdfKey,
    name: "Getting started",
  });
  expect(typeof result.folderSubkey).toBe("string");
  expect(result.folderSubkey.length).toBe(43);
  expect(typeof result.folderSubkeyId).toBe("number");
  expect(typeof result.ciphertext).toBe("string");
  expect(typeof result.publicNonce).toBe("string");
});

test("encryptFolderName with publicData", () => {
  const result = encryptFolderName({
    parentKey: kdfKey,
    name: "Getting started",
    publicData: { something: 4 },
  });
  expect(typeof result.ciphertext).toBe("string");
  expect(typeof result.publicNonce).toBe("string");
});

test("encryptFolderName with publicData fails for invalid publicData", () => {
  expect(() =>
    encryptFolderName({
      parentKey: kdfKey,
      name: "Getting started",
      publicData: function foo() {},
    })
  ).toThrowError(/Invalid public data for encrypting the name\./);
});
