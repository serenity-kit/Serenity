import sodium from "@serenity-tools/libsodium";
import { gql } from "graphql-request";
import { Role } from "../../../prisma/generated/output";
import { SnapshotDeviceKeyBox } from "../../../src/database/document/createDocumentShareLink";
import { Device } from "../../../src/types/device";

type CreateSnapshotDeviceKeyBoxParams = {
  receiverDeviceEncryptionPublicKeys: string[];
  creatorDeviceEncryptionPrivateKey: string;
  key: string;
};
const createSnapshotDeviceKeyBoxes = async ({
  receiverDeviceEncryptionPublicKeys,
  creatorDeviceEncryptionPrivateKey,
  key,
}: CreateSnapshotDeviceKeyBoxParams) => {
  const snapshotKeyBoxes: SnapshotDeviceKeyBox[] = [];
  for (const receiverDeviceEncryptionPublicKey of receiverDeviceEncryptionPublicKeys) {
    const nonce = await sodium.randombytes_buf(
      sodium.crypto_secretbox_NONCEBYTES
    );
    const ciphertext = await sodium.crypto_box_easy(
      key,
      nonce,
      receiverDeviceEncryptionPublicKey,
      creatorDeviceEncryptionPrivateKey
    );
    snapshotKeyBoxes.push({
      ciphertext,
      nonce,
      deviceSigningPublicKey: receiverDeviceEncryptionPublicKey,
    });
  }
  return snapshotKeyBoxes;
};

export type Params = {
  graphql: any;
  documentId: string;
  sharingRole: Role;
  deviceSecretBoxCiphertext: string;
  deviceSecretBoxNonce: string;
  creatorDevice: Device;
  creatorDeviceEncryptionPrivateKey: string;
  snapshotKey: string;
  receiverDeviceEncryptionPublicKeys: string[];
  authorizationHeader: string;
};

export const createDocumentShareLink = async ({
  graphql,
  documentId,
  sharingRole,
  deviceSecretBoxCiphertext,
  deviceSecretBoxNonce,
  creatorDevice,
  creatorDeviceEncryptionPrivateKey,
  snapshotKey,
  receiverDeviceEncryptionPublicKeys,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };

  const snapshotDeviceKeyBoxes = await createSnapshotDeviceKeyBoxes({
    receiverDeviceEncryptionPublicKeys,
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
        deviceSecretBoxCiphertext,
        deviceSecretBoxNonce,
        creatorDevice,
        snapshotDeviceKeyBoxes,
      },
    },
    authorizationHeaders
  );
  return result;
};
