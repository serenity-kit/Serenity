import { gql } from "graphql-request";

type Params = {
  graphql: any;
  authorizationHeader: string;
};

export const getMainDevice = async ({
  graphql,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  // get root folders from graphql
  const query = gql`
    {
      mainDevice {
        signingPublicKey
        nonce
        ciphertext
        encryptionKeySalt
        info
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
