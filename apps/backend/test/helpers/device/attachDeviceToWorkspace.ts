import { gql } from "graphql-request";

type Params = {
  graphql: any;
  workspaceId: string;
  deviceSigningPublicKey: string;
  deviceAeadCiphertext: string;
  authorizationHeader: string;
};

export const attachDeviceToWorkspace = async ({
  graphql,
  deviceSigningPublicKey,
  deviceAeadCiphertext,
  workspaceId,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const query = gql`
    mutation attachDeviceToWorkspace($input: AttachDeviceToWorkspaceInput!) {
      attachDeviceToWorkspace(input: $input) {
        workspaceKey {
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
    }
  `;
  const result = await graphql.client.request(
    query,
    {
      input: {
        workspaceId,
        signingPublicKey: deviceSigningPublicKey,
        ciphertext: deviceAeadCiphertext,
      },
    },
    authorizationHeaders
  );
  return result;
};
