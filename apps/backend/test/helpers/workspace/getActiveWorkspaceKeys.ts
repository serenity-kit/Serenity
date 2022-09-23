import { gql } from "graphql-request";
import { TestContext } from "../setupGraphql";

export type Props = {
  graphql: TestContext;
  workspaceId: string;
  deviceSigningPublicKey: string;
  sessionKey: string;
};
export const getActiveWorkspaceKeys = async ({
  graphql,
  workspaceId,
  deviceSigningPublicKey,
  sessionKey,
}: Props) => {
  const authorizationHeader = { authorization: sessionKey };
  const query = gql`
    query activeWorkspaceKeys(
      $workspaceId: ID!
      $deviceSigningPublicKey: String!
    ) {
      activeWorkspaceKeys(
        workspaceId: $workspaceId
        deviceSigningPublicKey: $deviceSigningPublicKey
      ) {
        activeWorkspaceKeys {
          generation
          workspaceId
          workspaceKeyBoxes {
            ciphertext
            nonce
            deviceSigningPublicKey
            creatorDeviceSigningPublicKey
            creatorDevice {
              signingPublicKey
              encryptionPublicKey
              encryptionPublicKeySignature
            }
          }
        }
      }
    }
  `;
  return await graphql.client.request(
    query,
    { workspaceId, deviceSigningPublicKey },
    authorizationHeader
  );
};
