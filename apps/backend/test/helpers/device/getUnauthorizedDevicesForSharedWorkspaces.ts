import { gql } from "graphql-request";
import { TestContext } from "../setupGraphql";

export type Props = {
  graphql: TestContext;
  sessionKey: string;
};
export const getUnauthorizedDevicesForSharedWorkspaces = async ({
  graphql,
  sessionKey,
}: Props) => {
  const authorizationHeader = { authorization: sessionKey };
  const query = gql`
    {
      unauthorizedDevicesForSharedWorkspaces {
        workspacesWithDevices {
          workspaceId
          devices {
            userId
            signingPublicKey
            encryptionPublicKey
            info
            createdAt
            encryptionPublicKeySignature
          }
        }
      }
    }
  `;
  return await graphql.client.request(query, null, authorizationHeader);
};
