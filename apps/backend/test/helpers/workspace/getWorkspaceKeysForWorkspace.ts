import { gql } from "graphql-request";

type Params = {
  graphql: any;
  authorizationHeader: string;
  workspaceId: string;
  deviceSigningPublicKey: string;
  first: number;
  after?: string;
};

export const getWorkspaceKeysForWorkspace = async ({
  graphql,
  authorizationHeader,
  workspaceId,
  deviceSigningPublicKey,
  first,
  after,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const query = gql`
    query workspaceKeys(
      $workspaceId: String!
      $deviceSigningPublicKey: String!
      $first: Int!
    ) {
      workspaceKeys(
        workspaceId: $workspaceId
        deviceSigningPublicKey: $deviceSigningPublicKey
        first: $first
      ) {
        edges {
          node {
            id
            workspaceId
            generation
            workspaceKeyBox {
              id
              deviceSigningPublicKey
              ciphertext
            }
          }
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
      deviceSigningPublicKey,
      first,
    },
    authorizationHeaders
  );
  return result;
};
