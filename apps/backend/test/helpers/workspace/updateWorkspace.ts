import { gql } from "graphql-request";
import { WorkspaceSharingParams } from "../../../src/database/workspace/updateWorkspace";

type Params = {
  graphql: any;
  id: string;
  name: string;
  permissions: WorkspaceSharingParams[];
  authorizationHeader: string;
};

export const updateWorkspace = async ({
  graphql,
  id,
  name,
  permissions,
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
        }
      }
    }
  `;
  const result = await graphql.client.request(
    query,
    { input: { id, name, permissions } },
    authorizationHeaders
  );
  return result;
};
