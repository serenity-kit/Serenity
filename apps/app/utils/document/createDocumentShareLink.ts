import { createDevice, recreateSnapshotKey } from "@serenity-tools/common";
import sodium from "@serenity-tools/libsodium";
import { Platform } from "react-native";
import {
  Role,
  runCreateDocumentShareLinkMutation,
  runLatestSnapshotQuery,
} from "../../generated/graphql";
import { Device } from "../../types/Device";
import { deriveFolderKey } from "../folder/deriveFolderKeyData";
import { getDocument } from "./getDocument";

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
  creatorDevice: Device;
  creatorDeviceEncryptionPrivateKey: string;
};
export const createDocumentShareLink = async ({
  documentId,
  creatorDevice,
  creatorDeviceEncryptionPrivateKey,
}: Props) => {
  // TODO: generate key from key derivation trace
  const document = await getDocument({ documentId });
  if (!document) {
    // TODO: handle in UI
    console.error("Document not found");
    return;
  }
  const snapshotResult = await runLatestSnapshotQuery(
    {
      documentId,
    },
    { requestPolicy: "network-only" }
  );
  if (snapshotResult.error) {
    // TODO: handle in UI
    console.error(snapshotResult.error.message);
    return;
  }
  const snapshot = snapshotResult.data?.latestSnapshot?.snapshot;
  if (!snapshot) {
    // TODO: What do we dot here?
    console.error("No snapshot for this document yet");
    return;
  }
  const snapshotKeyDerivationTrace = await deriveFolderKey({
    folderId: document.parentFolderId!,
    workspaceKeyId: snapshot.keyDerivationTrace.workspaceKeyId,
    workspaceId: document.workspaceId!,
    activeDevice: creatorDevice,
  });
  const snapshotKeyData = await recreateSnapshotKey({
    folderKey: snapshotKeyDerivationTrace.folderKeyData.key,
    subkeyId: snapshot.subkeyId,
  });
  const snapshotKey = snapshotKeyData.key;

  // const snapshotKey = await sodium.crypto_kdf_keygen();

  const virtualDevice = await createDevice();

  // create virtual device
  const virtualDeviceKey = await sodium.crypto_secretbox_keygen();
  // const virtualDeviceKey = await sodium.crypto_kdf_keygen();

  // encrypt virtual device
  const serializedVirtualDevice = await sodium.to_base64(
    JSON.stringify(virtualDevice)
  );
  const deviceSecretBoxNonce = await sodium.randombytes_buf(
    sodium.crypto_secretbox_NONCEBYTES
  );
  const deviceSecretBoxCiphertext = await sodium.crypto_secretbox_easy(
    serializedVirtualDevice,
    deviceSecretBoxNonce,
    virtualDeviceKey
  );

  const snapshotDeviceNonce = await sodium.randombytes_buf(
    sodium.crypto_secretbox_NONCEBYTES
  );
  const snapshotDeviceCiphertext = await sodium.crypto_box_easy(
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
        deviceSecretBoxCiphertext,
        deviceSecretBoxNonce,
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
    snapshotKey
  );
  return {
    token,
    snapshotKey,
    documentShareLink,
  };
};
