import { gql } from "graphql-request";

type Params = {
  graphql: any;
  signingPublicKey: string;
  authorizationHeader: string;
};

export const getRelatedDeviceBySigningPublicKey = async ({
  graphql,
  signingPublicKey,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  // get root folders from graphql
  const query = gql`
    {
      relatedDeviceBySigningPublicKey(signingPublicKey: "${signingPublicKey}") {
        device {
            userId
            signingPublicKey
            encryptionPublicKey
            encryptionPublicKeySignature
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
