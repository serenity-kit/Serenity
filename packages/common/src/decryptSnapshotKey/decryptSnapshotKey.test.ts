import sodium from "react-native-libsodium";
import { createDevice } from "../createDevice/createDevice";
import { encryptSnapshotKeyForShareLinkDevice } from "../encryptSnapshotKeyForShareLinkDevice/encryptSnapshotKeyForShareLinkDevice";
import { decryptSnapshotKey } from "./decryptSnapshotKey";

beforeAll(async () => {
  await sodium.ready;
});

test("decrypt snapshot key", () => {
  const documentId = "Xap-RWCrBdK8WjQDeYLV0jnt9k_ez1ol";
  const snapshotId = "GeyIuvSBeokOi0GX-ZKyw-kwFvgJNbee";
  const snapshotKey = "toD7aqDdLUbdz6QimFN8xQrwHX0joueeCdjPEoPvWYc";

  const creatorDevice = createDevice("user");
  const receiverDevice = createDevice("user");

  const { documentShareLinkDeviceBox } = encryptSnapshotKeyForShareLinkDevice({
    authorDevice: creatorDevice,
    shareLinkDevice: receiverDevice,
    documentId,
    snapshotId,
    snapshotKey: sodium.from_base64(snapshotKey),
  });

  const decryptedWorkspaceKey = decryptSnapshotKey({
    ciphertext: documentShareLinkDeviceBox.ciphertext,
    nonce: documentShareLinkDeviceBox.nonce,
    creatorDeviceEncryptionPublicKey: creatorDevice.encryptionPublicKey,
    receiverDeviceEncryptionPrivateKey: receiverDevice.encryptionPrivateKey,
    documentId,
    snapshotId,
  });
  expect(decryptedWorkspaceKey).toBe(snapshotKey);
});
