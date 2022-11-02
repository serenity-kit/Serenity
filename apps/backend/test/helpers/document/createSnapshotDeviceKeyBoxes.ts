import sodium from "@serenity-tools/libsodium";
import { SnapshotDeviceKeyBox } from "../../../src/database/document/createDocumentShareLink";
import { Device } from "../../../src/types/device";

export type Props = {
  receiverDevices: Device[];
  creatorDeviceEncryptionPrivateKey: string;
  key: string;
};
export const createSnapshotDeviceKeyBoxes = async ({
  receiverDevices,
  creatorDeviceEncryptionPrivateKey,
  key,
}: Props) => {
  const snapshotKeyBoxes: SnapshotDeviceKeyBox[] = [];
  for (const receiverDevice of receiverDevices) {
    const nonce = await sodium.randombytes_buf(
      sodium.crypto_secretbox_NONCEBYTES
    );
    const ciphertext = await sodium.crypto_box_easy(
      key,
      nonce,
      receiverDevice.encryptionPublicKey,
      creatorDeviceEncryptionPrivateKey
    );
    snapshotKeyBoxes.push({
      ciphertext,
      nonce,
      deviceSigningPublicKey: receiverDevice.signingPublicKey,
    });
  }
  return snapshotKeyBoxes;
};
