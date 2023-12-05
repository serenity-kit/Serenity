import { deriveSessionAuthorization } from "@serenity-tools/common";
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
  const authorizationHeader = {
    authorization: deriveSessionAuthorization({ sessionKey }).authorization,
  };
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
          id
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
