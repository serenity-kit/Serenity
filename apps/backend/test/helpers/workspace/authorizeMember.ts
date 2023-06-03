import { gql } from "graphql-request";

type Params = {
  graphql: any;
  workspaceId: string;
  creatorDeviceSigningPublicKey: string;
  authorizationHeader: string;
  workspaceKeys: any[];
};

export const authorizeMember = async ({
  graphql,
  workspaceId,
  creatorDeviceSigningPublicKey,
  authorizationHeader,
  workspaceKeys,
}: Params) => {
  const query = gql`
    mutation authorizeMember($input: AuthorizeMemberInput!) {
      authorizeMember(input: $input) {
        success
      }
    }
  `;
  const result = await graphql.client.request(
    query,
    {
      input: {
        workspaceId,
        creatorDeviceSigningPublicKey,
        workspaceKeys,
      },
    },
    {
      authorization: authorizationHeader,
    }
  );
  return result;
};
