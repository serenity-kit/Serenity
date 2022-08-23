import sodium from "@serenity-tools/libsodium";
import { encryptFolder } from "./encryptFolder";

const kdfKey = "3NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto";

beforeAll(async () => {
  await sodium.ready;
});

test("encryptFolder", async () => {
  const result = await encryptFolder({
    parentKey: kdfKey,
    name: "Getting started",
  });
  expect(typeof result.folderSubkey).toBe("string");
  expect(result.folderSubkey.length).toBe(43);
  expect(typeof result.folderSubkeyId).toBe("number");
  expect(typeof result.ciphertext).toBe("string");
  expect(typeof result.publicNonce).toBe("string");
});

test("encryptFolder with publicData", async () => {
  const result = await encryptFolder({
    parentKey: kdfKey,
    name: "Getting started",
    publicData: { something: 4 },
  });
  expect(typeof result.ciphertext).toBe("string");
  expect(typeof result.publicNonce).toBe("string");
});

test("encryptFolder with publicData fails for invalid publicData", async () => {
  await expect(
    (async () =>
      await encryptFolder({
        parentKey: kdfKey,
        name: "Getting started",
        publicData: function foo() {},
      }))()
  ).rejects.toThrowError(/Invalid public data for encrypting the name\./);
});
