import sodium from "@serenity-tools/libsodium";
import { gql } from "graphql-request";
import { Role } from "../../../prisma/generated/output";
import { SnapshotDeviceKeyBox } from "../../../src/database/document/createDocumentShareLink";
import { Device } from "../../../src/types/device";

type CreateSnapshotDeviceKeyBoxParams = {
  receiverDevices: Device[];
  creatorDeviceEncryptionPrivateKey: string;
  key: string;
};
const createSnapshotDeviceKeyBoxes = async ({
  receiverDevices,
  creatorDeviceEncryptionPrivateKey,
  key,
}: CreateSnapshotDeviceKeyBoxParams) => {
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

export type Params = {
  graphql: any;
  documentId: string;
  sharingRole: Role;
  creatorDevice: Device;
  creatorDeviceEncryptionPrivateKey: string;
  snapshotKey: string;
  receiverDevices: Device[];
  authorizationHeader: string;
};

export const createDocumentShareLink = async ({
  graphql,
  documentId,
  sharingRole,
  creatorDevice,
  creatorDeviceEncryptionPrivateKey,
  snapshotKey,
  receiverDevices,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };

  const snapshotDeviceKeyBoxes = await createSnapshotDeviceKeyBoxes({
    receiverDevices,
    creatorDeviceEncryptionPrivateKey,
    key: snapshotKey,
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
        sharingRole,
        creatorDeviceSigningPublicKey: creatorDevice.signingPublicKey,
        snapshotDeviceKeyBoxes,
      },
    },
    authorizationHeaders
  );
  return result;
};
