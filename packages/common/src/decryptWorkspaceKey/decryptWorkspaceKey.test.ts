import sodium from "react-native-libsodium";
import { createDevice } from "../createDevice/createDevice";
import { encryptWorkspaceKeyForDevice } from "../encryptWorkspaceKeyForDevice/encryptWorkspaceKeyForDevice";
import { decryptWorkspaceKey } from "./decryptWorkspaceKey";

beforeAll(async () => {
  await sodium.ready;
});

test("decrypt workspace key", () => {
  const workspaceId = "Xap-RWCrBdK8WjQDeYLV0jnt9k_ez1ol";
  const workspaceKeyId = "GeyIuvSBeokOi0GX-ZKyw-kwFvgJNbee";
  const workspaceKey = "toD7aqDdLUbdz6QimFN8xQrwHX0joueeCdjPEoPvWYc";

  const creatorDevice = createDevice("user");
  const receiverDevice = createDevice("user");

  const { ciphertext, nonce } = encryptWorkspaceKeyForDevice({
    creatorDeviceEncryptionPrivateKey: creatorDevice.encryptionPrivateKey,
    receiverDeviceEncryptionPublicKey: receiverDevice.encryptionPublicKey,
    workspaceId,
    workspaceKeyId,
    workspaceKey,
  });

  const decryptedWorkspaceKey = decryptWorkspaceKey({
    ciphertext,
    nonce,
    creatorDeviceEncryptionPublicKey: creatorDevice.encryptionPublicKey,
    receiverDeviceEncryptionPrivateKey: receiverDevice.encryptionPrivateKey,
    workspaceId,
    workspaceKeyId,
  });
  expect(decryptedWorkspaceKey).toBe(workspaceKey);
});
