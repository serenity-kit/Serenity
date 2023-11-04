import sodium from "react-native-libsodium";
import { createAndEncryptWorkspaceKeyForDevice } from "./createAndEncryptWorkspaceKeyForDevice";

beforeAll(async () => {
  await sodium.ready;
});

test("encrypt workspace key for device", () => {
  const receiverDeviceEncryptionPublicKey =
    "sizOegqS2xWZWeSX5yHAgwnjq3hwsuuQqu0KseZCagA";
  const creatorDeviceEncryptionPrivateKey =
    "4gC2Vfd7GxU70ktlAbyArUMi_cHJwY01gOk4cJ9VhhI";
  const result = createAndEncryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey,
    creatorDeviceEncryptionPrivateKey,
    workspaceId: "Xap-RWCrBdK8WjQDeYLV0jnt9k_ez1ol",
    workspaceKeyId: "GeyIuvSBeokOi0GX-ZKyw-kwFvgJNbee",
  });
  const { workspaceKey, nonce, ciphertext } = result;
  expect(typeof workspaceKey).toBe("string");
  expect(typeof nonce).toBe("string");
  expect(typeof ciphertext).toBe("string");
  expect(workspaceKey.length).toBe(43);
  expect(nonce.length).toBe(32);
  expect(ciphertext.length).toBe(131);
});
