import sodium from "react-native-libsodium";
import { encryptWorkspaceKeyForDevice } from "./encryptWorkspaceKeyForDevice";

beforeAll(async () => {
  await sodium.ready;
});

test("encrypt workspacekey for device, generate nonce", () => {
  const workspaceKey = "s_imxzQCAMWclGD7HKdIx9kS6c5G9q1aifmR3kHdDEg";
  const receiverDeviceEncryptionPublicKey =
    "f98_EhV2zPYuI4lBOsVrHP_OOG8O3e3-IDEv2CpwPSs";
  const creatorDeviceEncryptionPrivateKey =
    "Fg5YYtjnk7xXuSPJniYoVOCokFKa0x2j9eSkfu0u_Zg";
  const { ciphertext, nonce } = encryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey,
    creatorDeviceEncryptionPrivateKey,
    workspaceKey,
  });
  expect(typeof ciphertext).toBe("string");
  expect(typeof nonce).toBe("string");
  expect(ciphertext.length).toBe(64);
  expect(nonce.length).toBe(32);
});

test("encrypt workspacekey for device, existing nonce", () => {
  const nonce = "bVyq1RE8twQNhOOGD6jN9NnDsGX964Of";
  const workspaceKey = "s_imxzQCAMWclGD7HKdIx9kS6c5G9q1aifmR3kHdDEg";
  const receiverDeviceEncryptionPublicKey =
    "f98_EhV2zPYuI4lBOsVrHP_OOG8O3e3-IDEv2CpwPSs";
  const creatorDeviceEncryptionPrivateKey =
    "Fg5YYtjnk7xXuSPJniYoVOCokFKa0x2j9eSkfu0u_Zg";
  const { ciphertext } = encryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey,
    creatorDeviceEncryptionPrivateKey,
    workspaceKey,
    nonce,
  });
  expect(typeof ciphertext).toBe("string");
  expect(ciphertext.length).toBe(64);
  expect(ciphertext).toBe(
    "R4OVvMsR4GajXjQqm9alb6txehHUFqOCBmA1legQ8ozjWd6OI7Xg3coPVttqSutS"
  );
});
