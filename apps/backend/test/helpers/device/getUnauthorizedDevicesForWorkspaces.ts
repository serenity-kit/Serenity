import { gql } from "graphql-request";
import { TestContext } from "../setupGraphql";

export type Props = {
  graphql: TestContext;
  sessionKey: string;
};
export const getUnauthorizedDevicesForWorkspaces = async ({
  graphql,
  sessionKey,
}: Props) => {
  const authorizationHeader = { authorization: sessionKey };
  const query = gql`
    {
      unauthorizedDevicesForWorkspaces {
        unauthorizedMemberDevices {
          id
          members {
            id
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
    }
  `;
  return await graphql.client.request(query, null, authorizationHeader);
};
