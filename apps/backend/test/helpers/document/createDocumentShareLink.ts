import * as documentChain from "@serenity-kit/document-chain";
import {
  LocalDevice,
  ShareDocumentRole,
  createDevice,
} from "@serenity-tools/common";
import { gql } from "graphql-request";
import sodium from "react-native-libsodium";
import { SnapshotDeviceKeyBox } from "../../../src/database/document/createDocumentShareLink";
import { getLastDocumentChainEventByDocumentId } from "../documentChain/getLastDocumentChainEventByDocumentId";

export type Params = {
  graphql: any;
  documentId: string;
  sharingRole: ShareDocumentRole;
  mainDevice: LocalDevice;
  snapshotKey: string;
  authorizationHeader: string;
};

export const createDocumentShareLink = async ({
  graphql,
  documentId,
  sharingRole,
  mainDevice,
  snapshotKey,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
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

  const snapshotDeviceNonce = sodium.randombytes_buf(
    sodium.crypto_box_NONCEBYTES
  );
  const snapshotDeviceCiphertext = sodium.crypto_box_easy(
    sodium.from_base64(snapshotKey),
    snapshotDeviceNonce,
    sodium.from_base64(virtualDevice.encryptionPublicKey),
    sodium.from_base64(mainDevice.encryptionPrivateKey)
  );
  const snapshotDeviceKeyBox: SnapshotDeviceKeyBox = {
    ciphertext: sodium.to_base64(snapshotDeviceCiphertext),
    nonce: sodium.to_base64(snapshotDeviceNonce),
    deviceSigningPublicKey: virtualDevice.signingPublicKey,
  };

  const { lastChainEvent } = await getLastDocumentChainEventByDocumentId({
    documentId,
  });

  const documentChainEvent = documentChain.addShareDocumentDevice({
    authorKeyPair: {
      privateKey: mainDevice.signingPrivateKey,
      publicKey: mainDevice.signingPublicKey,
    },
    signingPublicKey: virtualDevice.signingPublicKey,
    encryptionPublicKey: virtualDevice.encryptionPublicKey,
    role: sharingRole,
    prevEvent: lastChainEvent,
    expiresAt: undefined,
  });

  const query = gql`
    mutation createDocumentShareLink($input: CreateDocumentShareLinkInput!) {
      createDocumentShareLink(input: $input) {
        token
      }
    }
  `;
  const result = await graphql.client.request(
    query,
    {
      input: {
        documentId,
        deviceSecretBoxCiphertext: sodium.to_base64(deviceSecretBoxCiphertext),
        deviceSecretBoxNonce: sodium.to_base64(deviceSecretBoxNonce),
        snapshotDeviceKeyBox,
        serializedDocumentChainEvent: JSON.stringify(documentChainEvent),
      },
    },
    authorizationHeaders
  );
  return result;
};
