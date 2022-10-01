import { gql } from "graphql-request";
import { WorkspaceMemberParams } from "../../../src/database/workspace/updateWorkspaceName";

type Params = {
  graphql: any;
  id: string;
  members: WorkspaceMemberParams[] | undefined;
  authorizationHeader: string;
};

export const updateWorkspaceMembersRoles = async ({
  graphql,
  id,
  members,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };

  const query = gql`
    mutation updateWorkspaceMembersRoles(
      $input: UpdateWorkspaceMembersRolesInput!
    ) {
      updateWorkspaceMembersRoles(input: $input) {
        workspace {
          id
          name
          members {
            userId
            isAdmin
          }
        }
      }
    }
  `;
  const result = await graphql.client.request(
    query,
    { input: { id, members } },
    authorizationHeaders
  );
  return result;
};
