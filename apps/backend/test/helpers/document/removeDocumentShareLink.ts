import { gql } from "graphql-request";
import { Device } from "../../../src/types/device";
import { createSnapshotDeviceKeyBoxes } from "./createSnapshotDeviceKeyBoxes";

export type Params = {
  graphql: any;
  token: string;
  creatorDevice: Device;
  creatorDeviceEncryptionPrivateKey: string;
  snapshotKey: string;
  receiverDevices: Device[];
  authorizationHeader: string;
};

export const removeDocumentShareLink = async ({
  graphql,
  token,
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
    mutation removeDocumentShareLink($input: RemoveDocumentShareLinkInput!) {
      removeDocumentShareLink(input: $input) {
        success
      }
    }
  `;
  const result = await graphql.client.request(
    query,
    {
      input: {
        token,
        creatorDevice,
        snapshotDeviceKeyBoxes,
      },
    },
    authorizationHeaders
  );
  console.log({ result });
  return result;
};
