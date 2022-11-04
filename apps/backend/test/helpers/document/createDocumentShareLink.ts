import { createDevice } from "@serenity-tools/common";
import sodium from "@serenity-tools/libsodium";
import { gql } from "graphql-request";
import { Role } from "../../../prisma/generated/output";
import { SnapshotDeviceKeyBox } from "../../../src/database/document/createDocumentShareLink";
import { Device } from "../../../src/types/device";

export type Params = {
  graphql: any;
  documentId: string;
  sharingRole: Role;
  creatorDevice: Device;
  creatorDeviceEncryptionPrivateKey: string;
  snapshotKey: string;
  authorizationHeader: string;
};

export const createDocumentShareLink = async ({
  graphql,
  documentId,
  sharingRole,
  creatorDevice,
  creatorDeviceEncryptionPrivateKey,
  snapshotKey,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const virtualDevice = await createDevice();

  // create virtual device
  const virtualDeviceKey = await sodium.crypto_secretbox_keygen();

  // encrypt virtual device
  const serializedVirtualDevice = sodium.to_base64(
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
        sharingRole,
        deviceSecretBoxCiphertext,
        deviceSecretBoxNonce,
        creatorDeviceSigningPublicKey: creatorDevice.signingPublicKey,
        snapshotDeviceKeyBox,
      },
    },
    authorizationHeaders
  );
  return result;
};