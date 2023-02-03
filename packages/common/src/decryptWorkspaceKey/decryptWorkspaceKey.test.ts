import sodium from "react-native-libsodium";
import { decryptWorkspaceKey } from "./decryptWorkspaceKey";

beforeAll(async () => {
  await sodium.ready;
});

test("decrypt workspace key", () => {
  const nonce = "tWowcePQUts7U35mCW7TUvR-8p_9KQMA";
  const ciphertext =
    "59Ua5K1dkXqOGZVpmlR1sYW6hUW5ZtWfCFANglSmF1hURfnTxOi1MlVXAWuDAmTM";
  const creatorDeviceEncryptionPublicKey =
    "sizOegqS2xWZWeSX5yHAgwnjq3hwsuuQqu0KseZCagA";
  const receiverDeviceEncryptionPrivateKey =
    "4gC2Vfd7GxU70ktlAbyArUMi_cHJwY01gOk4cJ9VhhI";
  const workspaceKey = decryptWorkspaceKey({
    ciphertext,
    nonce,
    creatorDeviceEncryptionPublicKey,
    receiverDeviceEncryptionPrivateKey,
  });
  expect(typeof workspaceKey).toBe("string");
  expect(workspaceKey.length).toBe(43);
  expect(workspaceKey).toBe("toD7aqDdLUbdz6QimFN8xQrwHX0joueeCdjPEoPvWYc");
});
