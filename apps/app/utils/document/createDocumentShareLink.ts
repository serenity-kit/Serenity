import sodium from "@serenity-tools/libsodium";
import { Platform } from "react-native";
import {
  Role,
  runCreateDocumentShareLinkMutation,
} from "../../generated/graphql";
import { Device } from "../../types/Device";
import { createAndEncryptKeyForDevice } from "../device/createAndEncryptKeyForDevice";

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
  return `${rootUrl}/share/${documentId}/${token}#key=${key}`;
};

export type Props = {
  documentId: string;
  devices: Device[];
  creatorDevice: Device;
  creatorDeviceEncryptionPrivateKey: string;
};
export const createDocumentShareLink = async ({
  documentId,
  devices,
  creatorDevice,
  creatorDeviceEncryptionPrivateKey,
}: Props) => {
  const snapshotKey = await sodium.crypto_kdf_keygen();

  const snapshotDeviceKeyBoxes: SnapshotDeviceKeyBox[] = [];
  for (const receiverDevice of devices) {
    if (!receiverDevice) {
      continue;
    }
    // NOTE: we are encrypting a snapshotKey, not a workspaceKey,
    // but we are using the same
    const { nonce, ciphertext } = await createAndEncryptKeyForDevice({
      receiverDeviceEncryptionPublicKey: receiverDevice.encryptionPublicKey,
      creatorDeviceEncryptionPrivateKey: creatorDeviceEncryptionPrivateKey!,
      workspaceKey: snapshotKey,
    });
    snapshotDeviceKeyBoxes.push({
      ciphertext,
      nonce,
      deviceSigningPublicKey: receiverDevice.signingPublicKey,
    });
  }

  const response = await runCreateDocumentShareLinkMutation(
    {
      input: {
        creatorDeviceSigningPublicKey: creatorDevice.signingPublicKey!,
        documentId: documentId,
        sharingRole: Role.Viewer,
        snapshotDeviceKeyBoxes,
      },
    },
    {}
  );
  if (!response.data?.createDocumentShareLink?.token) {
    throw new Error("Couldn't create share link");
  }
  const token = response.data.createDocumentShareLink.token;
  const documentSshareLink = getDocumentShareLinkUrl(
    documentId,
    token,
    snapshotKey
  );
  return {
    token,
    snapshotKey,
    documentSshareLink,
  };
};
