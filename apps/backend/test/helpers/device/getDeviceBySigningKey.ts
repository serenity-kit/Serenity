import { gql } from "graphql-request";

type Params = {
  graphql: any;
  signingPublicKey: string;
  authorizationHeader: string;
};

export const getDeviceBySigningPublicKey = async ({
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
      deviceBySigningPublicKey(signingPublicKey: "${signingPublicKey}") {
        device {
            userId
            signingPublicKey
            signingKeyType
            encryptionPublicKey
            encryptionKeyType
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
