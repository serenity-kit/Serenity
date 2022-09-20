import { gql } from "graphql-request";
import { TestContext } from "../setupGraphql";

type Params = {
  graphql: TestContext;
  workspaceId: string;
  authorizationHeader: string;
};

export const getWorkspaceDevices = async ({
  graphql,
  authorizationHeader,
  workspaceId,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };

  // get root folders from graphql
  const query = gql`
    query workspaceDevices($workspaceId: ID!) {
      workspaceDevices(workspaceId: $workspaceId, first: 500) {
        nodes {
          userId
          signingPublicKey
          encryptionPublicKey
          encryptionPublicKeySignature
          info
          createdAt
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;
  const result = await graphql.client.request(
    query,
    {
      workspaceId,
    },
    authorizationHeaders
  );
  return result;
};
