import { gql } from "graphql-request";
import { WorkspaceMemberParams } from "../../../src/database/workspace/updateWorkspace";

type Params = {
  graphql: any;
  id: string;
  name: string;
  members: WorkspaceMemberParams[];
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
    mutation updateWorkspace($input: UpdateWorkspacesInput!) {
      updateWorkspace(input: $input) {
        workspace {
          id
          name
          members {
            username
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
