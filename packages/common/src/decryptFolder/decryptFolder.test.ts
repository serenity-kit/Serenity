import sodium from "@serenity-tools/libsodium";
import { encryptFolder } from "../encryptFolder/encryptFolder";
import { decryptFolder, reconstructFolderKey } from "./decryptFolder";

beforeAll(async () => {
  await sodium.ready;
});

test("reconstructFolderKey", async () => {
  const kdfKey = "3NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto";
  const result = await reconstructFolderKey(kdfKey, 5200022);
  const { subkeyId, key } = result;
  expect(subkeyId).toBe(5200022);
  expect(key).toBe("R2ycEA9jEapG3MEAM3VEgYsKgiwkMm_JuwqbtfE13F4");
});

test("decryptFolder", async () => {
  const kdfKey = "3NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto";
  const result = await encryptFolder({
    workspaceKey: kdfKey,
    name: "Getting started",
  });
  const decryptFolderResult = await decryptFolder({
    workspaceKey: kdfKey,
    ciphertext: result.ciphertext,
    publicNonce: result.publicNonce,
    subkeyId: result.folderSubkeyId,
  });
  expect(sodium.from_base64_to_string(decryptFolderResult)).toBe(
    "Getting started"
  );
});
