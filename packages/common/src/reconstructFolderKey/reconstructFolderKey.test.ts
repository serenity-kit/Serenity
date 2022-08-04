import sodium from "@serenity-tools/libsodium";
import { reconstructFolderKey } from "./reconstructFolderKey";

beforeAll(async () => {
  await sodium.ready;
});

test("createFolderKey", async () => {
  const kdfKey = "3NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto";
  const result = await reconstructFolderKey(kdfKey, 5200022);
  const { subkeyId, key } = result;
  expect(subkeyId).toBe(5200022);
  expect(key).toBe("R2ycEA9jEapG3MEAM3VEgYsKgiwkMm_JuwqbtfE13F4");
});
