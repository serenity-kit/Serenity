import { createDevice } from "@serenity-tools/common";
import sodiumOld from "@serenity-tools/libsodium";
import { Platform } from "react-native";
import sodium from "react-native-libsodium";
import {
  Role,
  runCreateDocumentShareLinkMutation,
} from "../../generated/graphql";
import { Device } from "../../types/Device";

type SnapshotDeviceKeyBox = {
  ciphertext: string;
  nonce: string;
  deviceSigningPublicKey: string;
};

export const getDocumentShareLinkUrl = (
  documentId: string,
  token: string,
  key: string
) => {
  const rootUrl =
    process.env.NODE_ENV === "development" || process.env.IS_E2E_TEST === "true"
      ? Platform.OS === "web"
        ? `http://${window.location.host}`
        : // on iOS window.location.host is not available
          `http://localhost:19006/`
      : "https://www.serenity.li";
  return `${rootUrl}/page/${documentId}/${token}#key=${key}`;
};

export type Props = {
  documentId: string;
  creatorDevice: Device;
  creatorDeviceEncryptionPrivateKey: string;
};
export const createDocumentShareLink = async ({
  documentId,
  creatorDevice,
  creatorDeviceEncryptionPrivateKey,
}: Props) => {
  // TODO: generate key from key derivation trace
  const snapshotKey = await sodiumOld.crypto_kdf_keygen();

  const virtualDevice = await createDevice();

  // create virtual device
  const virtualDeviceKey = sodium.crypto_secretbox_keygen();

  // encrypt virtual device
  const serializedVirtualDevice = JSON.stringify(virtualDevice);
  const deviceSecretBoxNonce = sodium.randombytes_buf(
    sodium.crypto_secretbox_NONCEBYTES
  );
  const deviceSecretBoxCiphertext = sodium.crypto_secretbox_easy(
    serializedVirtualDevice,
    deviceSecretBoxNonce,
    virtualDeviceKey
  );

  const snapshotDeviceNonce = await sodiumOld.randombytes_buf(
    sodiumOld.crypto_secretbox_NONCEBYTES
  );
  const snapshotDeviceCiphertext = sodiumOld.crypto_box_easy(
    snapshotKey,
    snapshotDeviceNonce,
    virtualDevice.encryptionPublicKey,
    creatorDeviceEncryptionPrivateKey
  );
  const snapshotDeviceKeyBox: SnapshotDeviceKeyBox = {
    ciphertext: snapshotDeviceCiphertext,
    nonce: snapshotDeviceNonce,
    deviceSigningPublicKey: virtualDevice.signingPublicKey,
  };

  const response = await runCreateDocumentShareLinkMutation(
    {
      input: {
        creatorDeviceSigningPublicKey: creatorDevice.signingPublicKey!,
        deviceSecretBoxCiphertext: sodium.to_base64(deviceSecretBoxCiphertext),
        deviceSecretBoxNonce: sodium.to_base64(deviceSecretBoxNonce),
        deviceSigningPublicKey: virtualDevice.signingPublicKey,
        deviceEncryptionPublicKey: virtualDevice.encryptionPublicKey,
        deviceEncryptionPublicKeySignature:
          virtualDevice.encryptionPublicKeySignature,
        documentId: documentId,
        sharingRole: Role.Viewer,
        snapshotDeviceKeyBox,
      },
    },
    {}
  );

  if (!response.data?.createDocumentShareLink?.token) {
    throw new Error("Couldn't create share link");
  }
  const token = response.data.createDocumentShareLink.token;
  const documentShareLink = getDocumentShareLinkUrl(
    documentId,
    token,
    sodium.to_base64(virtualDeviceKey)
  );
  return {
    token,
    virtualDeviceKey: sodium.to_base64(virtualDeviceKey),
    snapshotKey,
    documentShareLink,
  };
};
