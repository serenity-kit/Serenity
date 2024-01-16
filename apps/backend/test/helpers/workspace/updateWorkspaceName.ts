import * as workspaceMemberDevicesProofUtil from "@serenity-kit/workspace-member-devices-proof";
import { LocalDevice, encryptWorkspaceInfo } from "@serenity-tools/common";
import { gql } from "graphql-request";

type Params = {
  graphql: any;
  id: string;
  name: string;
  workspaceKey: string;
  workspaceKeyId: string;
  authorizationHeader: string;
  device: LocalDevice;
  workspaceMemberDevicesProof: workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProof;
};

export const updateWorkspaceName = async ({
  graphql,
  id,
  name,
  workspaceKey,
  workspaceKeyId,
  authorizationHeader,
  device,
  workspaceMemberDevicesProof,
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
          infoSignature
          infoWorkspaceMemberDevicesProofHash
          infoCreatorDeviceSigningPublicKey
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

  const workspaceInfo = encryptWorkspaceInfo({
    name,
    key: workspaceKey,
    device,
    workspaceId: id,
    workspaceKeyId,
    workspaceMemberDevicesProof,
  });

  const result = await graphql.client.request(
    query,
    {
      input: {
        id,
        infoCiphertext: workspaceInfo.ciphertext,
        infoNonce: workspaceInfo.nonce,
        infoWorkspaceKeyId: workspaceKeyId,
        infoSignature: workspaceInfo.signature,
      },
    },
    authorizationHeaders
  );
  return result;
};
