import { gql } from "graphql-request";

type Params = {
  graphql: any;
  serializedWorkspaceChainEvent: string;
  authorizationHeader: string;
};

export const deleteWorkspaceInvitations = async ({
  graphql,
  serializedWorkspaceChainEvent,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const query = gql`
    mutation deleteWorkspaceInvitations(
      $input: DeleteWorkspaceInvitationsInput!
    ) {
      deleteWorkspaceInvitations(input: $input) {
        status
      }
    }
  `;
  const result = await graphql.client.request(
    query,
    {
      input: {
        serializedWorkspaceChainEvent,
      },
    },
    authorizationHeaders
  );
  return result;
};
