import { gql } from "graphql-request";
import { WorkspaceMemberParams } from "../../../src/database/workspace/updateWorkspace";

type Params = {
  graphql: any;
  id: string;
  name: string | undefined;
  members: WorkspaceMemberParams[] | undefined;
  authorizationHeader: string;
};

export const updateWorkspace = async ({
  graphql,
  id,
  name,
  members,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };

  const query = gql`
    mutation updateWorkspace($input: UpdateWorkspaceInput!) {
      updateWorkspace(input: $input) {
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
    { input: { id, name, members } },
    authorizationHeaders
  );
  return result;
};
