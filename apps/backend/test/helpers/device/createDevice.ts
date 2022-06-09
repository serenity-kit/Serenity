import { gql } from "graphql-request";

type Params = {
  graphql: any;
  authorizationHeader: string;
};

export const createDevice = async ({
  graphql,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const query = gql`
    mutation createDevice {
      createDevice {
        device {
          userId
          signingPublicKey
          signingPrivateKey
          signingKeyType
          encryptionPublicKey
          encryptionPrivateKey
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
