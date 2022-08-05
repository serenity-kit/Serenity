import { gql } from "graphql-request";

type Params = {
  graphql: any;
  workspaceId: string;
  deviceSigningPublicKey: string;
  creatorDeviceSigningPublicKey: string;
  deviceAeadNonce: string;
  deviceAeadCiphertext: string;
  authorizationHeader: string;
};

export const attachDeviceToWorkspace = async ({
  graphql,
  deviceSigningPublicKey,
  creatorDeviceSigningPublicKey,
  deviceAeadNonce,
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
        receiverDeviceSigningPublicKey: deviceSigningPublicKey,
        creatorDeviceSigningPublicKey,
        nonce: deviceAeadNonce,
        ciphertext: deviceAeadCiphertext,
      },
    },
    authorizationHeaders
  );
  return result;
};
