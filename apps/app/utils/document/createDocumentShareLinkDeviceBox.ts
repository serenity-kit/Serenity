import {
  Device,
  DocumentShareLinkDeviceBox,
  LocalDevice,
} from "@serenity-tools/common";
import sodium from "react-native-libsodium";

export type Props = {
  snapshotKey: Uint8Array;
  authorDevice: LocalDevice;
  shareLinkDevice: Device;
};
export const createDocumentShareLinkDeviceBox = ({
  shareLinkDevice,
  snapshotKey,
  authorDevice,
}: Props) => {
  const snapshotDeviceNonce = sodium.randombytes_buf(
    sodium.crypto_box_NONCEBYTES
  );
  const snapshotDeviceCiphertext = sodium.crypto_box_easy(
    snapshotKey,
    snapshotDeviceNonce,
    sodium.from_base64(shareLinkDevice.encryptionPublicKey),
    sodium.from_base64(authorDevice.encryptionPrivateKey)
  );
  const documentShareLinkDeviceBox: DocumentShareLinkDeviceBox = {
    ciphertext: sodium.to_base64(snapshotDeviceCiphertext),
    nonce: sodium.to_base64(snapshotDeviceNonce),
    deviceSigningPublicKey: shareLinkDevice.signingPublicKey,
  };

  return {
    documentShareLinkDeviceBox,
  };
};
