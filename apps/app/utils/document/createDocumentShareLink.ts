import * as documentChain from "@serenity-kit/document-chain";
import {
  createDevice,
  LocalDevice,
  ShareDocumentRole,
} from "@serenity-tools/common";
import sodium from "react-native-libsodium";
import { runCreateDocumentShareLinkMutation } from "../../generated/graphql";
import { getEnvironmentUrls } from "../getEnvironmentUrls/getEnvironmentUrls";

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
  const { frontendOrigin } = getEnvironmentUrls();
  return `${frontendOrigin}/page/${documentId}/${token}#key=${key}`;
};

export type Props = {
  documentId: string;
  snapshotKey: Uint8Array;
  sharingRole: ShareDocumentRole;
  mainDevice: LocalDevice;
  prevDocumentChainEvent: documentChain.DocumentChainEvent;
};
export const createDocumentShareLink = async ({
  documentId,
  snapshotKey,
  sharingRole,
  mainDevice,
  prevDocumentChainEvent,
}: Props) => {
  const virtualDevice = createDevice("share-document");

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

  const documentChainEvent = documentChain.addShareDocumentDevice({
    authorKeyPair: {
      privateKey: mainDevice.signingPrivateKey,
      publicKey: mainDevice.signingPublicKey,
    },
    signingPublicKey: virtualDevice.signingPublicKey,
    encryptionPublicKey: virtualDevice.encryptionPublicKey,
    role: sharingRole,
    prevEvent: prevDocumentChainEvent,
    expiresAt: undefined,
  });

  const snapshotDeviceNonce = sodium.randombytes_buf(
    sodium.crypto_box_NONCEBYTES
  );
  const snapshotDeviceCiphertext = sodium.crypto_box_easy(
    snapshotKey,
    snapshotDeviceNonce,
    sodium.from_base64(virtualDevice.encryptionPublicKey),
    sodium.from_base64(mainDevice.encryptionPrivateKey)
  );
  const snapshotDeviceKeyBox: SnapshotDeviceKeyBox = {
    ciphertext: sodium.to_base64(snapshotDeviceCiphertext),
    nonce: sodium.to_base64(snapshotDeviceNonce),
    deviceSigningPublicKey: virtualDevice.signingPublicKey,
  };

  const response = await runCreateDocumentShareLinkMutation(
    {
      input: {
        deviceSecretBoxCiphertext: sodium.to_base64(deviceSecretBoxCiphertext),
        deviceSecretBoxNonce: sodium.to_base64(deviceSecretBoxNonce),
        documentId: documentId,
        snapshotDeviceKeyBox,
        serializedDocumentChainEvent: JSON.stringify(documentChainEvent),
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
    snapshotKey: sodium.to_base64(snapshotKey),
    documentShareLink,
  };
};
