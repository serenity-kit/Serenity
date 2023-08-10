import { gql } from "graphql-request";

type Params = {
  graphql: any;
  onlyNotExpired: boolean;
  authorizationHeader: string;
};

export const getDevices = async ({
  graphql,
  onlyNotExpired,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };

  // get root folders from graphql
  const query = gql`
    {
      devices(onlyNotExpired: ${onlyNotExpired}, first: 50) {
        edges {
          node {
            signingPublicKey
            encryptionPublicKey
            encryptionPublicKeySignature
            info
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
