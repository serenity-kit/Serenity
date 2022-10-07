import { gql } from "graphql-request";

type Params = {
  graphql: any;
  hasNonExpiredSession: boolean;
  authorizationHeader: string;
};

export const getDevices = async ({
  graphql,
  hasNonExpiredSession,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };

  // get root folders from graphql
  const query = gql`
    {
      devices(hasNonExpiredSession: ${hasNonExpiredSession}, first: 50) {
        edges {
          node {
            userId
            signingPublicKey
            encryptionPublicKey
            encryptionPublicKeySignature
            info
            mostRecentSession {
              expiresAt
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
    null,
    authorizationHeaders
  );
  return result;
};
