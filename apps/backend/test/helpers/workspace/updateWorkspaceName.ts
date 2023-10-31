import { encryptWorkspaceInfo } from "@serenity-tools/common";
import { gql } from "graphql-request";

type Params = {
  graphql: any;
  id: string;
  name: string;
  workspaceKey: string;
  workspaceKeyId: string;
  authorizationHeader: string;
};

export const updateWorkspaceName = async ({
  graphql,
  id,
  name,
  workspaceKey,
  workspaceKeyId,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };

  const query = gql`
    mutation updateWorkspaceName($input: UpdateWorkspaceNameInput!) {
      updateWorkspaceName(input: $input) {
        workspace {
          id
          infoCiphertext
          infoNonce
          infoWorkspaceKey {
            id
            workspaceId
            generation
            workspaceKeyBox {
              id
              workspaceKeyId
              deviceSigningPublicKey
              ciphertext
              nonce
              creatorDevice {
                signingPublicKey
                encryptionPublicKey
              }
            }
          }
        }
      }
    }
  `;

  const workspaceInfo = encryptWorkspaceInfo({ name, key: workspaceKey });

  const result = await graphql.client.request(
    query,
    {
      input: {
        id,
        infoCiphertext: workspaceInfo.ciphertext,
        infoNonce: workspaceInfo.nonce,
        infoWorkspaceKeyId: workspaceKeyId,
      },
    },
    authorizationHeaders
  );
  return result;
};
