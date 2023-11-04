import * as documentChain from "@serenity-kit/document-chain";
import {
  createDevice,
  encryptSnapshotKeyForShareLinkDevice,
  LocalDevice,
  ShareDocumentRole,
} from "@serenity-tools/common";
import sodium from "react-native-libsodium";
import { runCreateDocumentShareLinkMutation } from "../../generated/graphql";
import { getEnvironmentUrls } from "../getEnvironmentUrls/getEnvironmentUrls";

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
  snapshotId: string;
  snapshotKey: Uint8Array;
  sharingRole: ShareDocumentRole;
  mainDevice: LocalDevice;
  prevDocumentChainEvent: documentChain.DocumentChainEvent;
};
export const createDocumentShareLink = async ({
  documentId,
  snapshotKey,
  snapshotId,
  sharingRole,
  mainDevice,
  prevDocumentChainEvent,
}: Props) => {
  const shareLinkDevice = createDevice("share-document");

  // create virtual device
  const shareLinkDeviceKey = sodium.crypto_secretbox_keygen();

  // encrypt virtual device
  const serializedShareLinkDevice = JSON.stringify(shareLinkDevice);
  const deviceSecretBoxNonce = sodium.randombytes_buf(
    sodium.crypto_secretbox_NONCEBYTES
  );
  const deviceSecretBoxCiphertext = sodium.crypto_secretbox_easy(
    serializedShareLinkDevice,
    deviceSecretBoxNonce,
    shareLinkDeviceKey
  );

  const documentChainEvent = documentChain.addShareDocumentDevice({
    authorKeyPair: {
      privateKey: mainDevice.signingPrivateKey,
      publicKey: mainDevice.signingPublicKey,
    },
    signingPublicKey: shareLinkDevice.signingPublicKey,
    encryptionPublicKey: shareLinkDevice.encryptionPublicKey,
    role: sharingRole,
    prevEvent: prevDocumentChainEvent,
    expiresAt: undefined,
  });

  const { documentShareLinkDeviceBox } = encryptSnapshotKeyForShareLinkDevice({
    shareLinkDevice,
    snapshotKey,
    authorDevice: mainDevice,
    documentId,
    snapshotId,
  });

  const response = await runCreateDocumentShareLinkMutation(
    {
      input: {
        deviceSecretBoxCiphertext: sodium.to_base64(deviceSecretBoxCiphertext),
        deviceSecretBoxNonce: sodium.to_base64(deviceSecretBoxNonce),
        documentId: documentId,
        snapshotDeviceKeyBox: documentShareLinkDeviceBox,
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
    sodium.to_base64(shareLinkDeviceKey)
  );
  return {
    token,
    shareLinkDeviceKey: sodium.to_base64(shareLinkDeviceKey),
    snapshotKey: sodium.to_base64(snapshotKey),
    documentShareLink,
  };
};
