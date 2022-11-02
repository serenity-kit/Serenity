import { gql } from "graphql-request";
import { Role } from "../../../prisma/generated/output";
import { Device } from "../../../src/types/device";

type Params = {
  graphql: any;
  documentId: string;
  sharingRole: Role;
  deviceSecretBoxCiphertext: string;
  deviceSecretBoxNonce: string;
  creatorDevice: Device;
  authorizationHeader: string;
};

export const createDocumentShareLink = async ({
  graphql,
  documentId,
  sharingRole,
  deviceSecretBoxCiphertext,
  deviceSecretBoxNonce,
  creatorDevice,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
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
        creatorDevice,
      },
    },
    authorizationHeaders
  );
  return result;
};
