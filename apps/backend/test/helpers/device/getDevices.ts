import { gql } from "graphql-request";

type Params = {
  graphql: any;
  authorizationHeader: string;
};

export const getDevices = async ({ graphql, authorizationHeader }: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };

  // get root folders from graphql
  const query = gql`
    {
      devices(first: 50) {
        edges {
          node {
            userId
            signingPublicKey
            encryptionPublicKey
            encryptionPublicKeySignature
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
    null,
    authorizationHeaders
  );
  return result;
};
