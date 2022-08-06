import sodium from "@serenity-tools/libsodium";
import { encryptFolder } from "../encryptFolder/encryptFolder";
import { decryptFolder } from "./decryptFolder";

beforeAll(async () => {
  await sodium.ready;
});

test("decryptFolder", async () => {
  const kdfKey = "3NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto";
  const result = await encryptFolder({
    parentKey: kdfKey,
    name: "Getting started",
  });
  const decryptFolderResult = await decryptFolder({
    parentKey: kdfKey,
    ciphertext: result.ciphertext,
    publicNonce: result.publicNonce,
    subkeyId: result.folderSubkeyId,
  });
  expect(sodium.from_base64_to_string(decryptFolderResult)).toBe(
    "Getting started"
  );
});
