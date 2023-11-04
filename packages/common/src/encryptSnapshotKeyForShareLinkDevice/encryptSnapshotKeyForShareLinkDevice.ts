import {
  Device,
  DocumentShareLinkDeviceBox,
  LocalDevice,
} from "@serenity-tools/common";
import { prefixWithUint8Array } from "@serenity-tools/secsync/src/utils/prefixWithUint8Array";
import sodium from "react-native-libsodium";

// first 1 indicating snapshot key domain context
// second 0 indicating the snapshot key encryption version
export const snapshotKeyEncryptionDomainContextAndVersion = new Uint8Array([
  1, 0,
]);

export type Props = {
  snapshotKey: Uint8Array;
  authorDevice: LocalDevice;
  shareLinkDevice: Device;
  documentId: string;
  snapshotId: string;
};
export const encryptSnapshotKeyForShareLinkDevice = ({
  shareLinkDevice,
  snapshotKey,
  authorDevice,
  documentId,
  snapshotId,
}: Props) => {
  const snapshotDeviceNonce = sodium.randombytes_buf(
    sodium.crypto_box_NONCEBYTES
  );

  let content = prefixWithUint8Array(
    snapshotKey,
    sodium.from_base64(snapshotId)
  );
  content = prefixWithUint8Array(content, sodium.from_base64(documentId));
  content = prefixWithUint8Array(
    content,
    snapshotKeyEncryptionDomainContextAndVersion
  );

  const snapshotDeviceCiphertext = sodium.crypto_box_easy(
    content,
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
