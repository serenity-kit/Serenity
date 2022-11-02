import { gql } from "graphql-request";
import { Role } from "../../../prisma/generated/output";
import { Device } from "../../../src/types/device";
import { createSnapshotDeviceKeyBoxes } from "./createSnapshotDeviceKeyBoxes";

export type Params = {
  graphql: any;
  documentId: string;
  sharingRole: Role;
  deviceSecretBoxCiphertext: string;
  deviceSecretBoxNonce: string;
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
  deviceSecretBoxCiphertext,
  deviceSecretBoxNonce,
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
