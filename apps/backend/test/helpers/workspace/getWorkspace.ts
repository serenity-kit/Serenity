import { gql } from "graphql-request";
import { TestContext } from "../setupGraphql";

export type Props = {
  graphql: TestContext;
  workspaceId?: string;
  deviceSigningPublicKey: string;
  authorizationHeader: string;
};
export const getWorkspace = async ({
  graphql,
  workspaceId,
  deviceSigningPublicKey,
  authorizationHeader,
}: Props) => {
  const headers = { authorization: authorizationHeader };
  const query = gql`
    query workspace($id: ID, $deviceSigningPublicKey: String!) {
      workspace(id: $id, deviceSigningPublicKey: $deviceSigningPublicKey) {
        id
        name
        members {
          username
          role
        }
        currentWorkspaceKey {
          id
          workspaceId
          generation
          workspaceKeyBox {
            id
            workspaceKeyId
            deviceSigningPublicKey
            creatorDeviceSigningPublicKey
            ciphertext
            nonce
            creatorDevice {
              signingPublicKey
              encryptionPublicKey
            }
          }
        }
        workspaceKeys {
          id
          workspaceId
          generation
          workspaceKeyBox {
            id
            workspaceKeyId
            deviceSigningPublicKey
            creatorDeviceSigningPublicKey
            ciphertext
            creatorDevice {
              signingPublicKey
              encryptionPublicKey
            }
          }
        }
      }
    }
  `;
  const result = await graphql.client.request(
    query,
    { id: workspaceId, deviceSigningPublicKey },
    headers
  );
  return result;
};
