import { gql } from "graphql-request";

type Params = {
  graphql: any;
  id: string;
  name: string | null;
  parentFolderId: string | null | undefined;
  workspaceId: string;
  authorizationHeader: string;
};

export const createFolder = async ({
  graphql,
  id,
  name,
  parentFolderId,
  workspaceId,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };

  const query = gql`
    mutation createFolder($input: CreateFolderInput!) {
      createFolder(input: $input) {
        folder {
          id
          name
          parentFolderId
          rootFolderId
          workspaceId
        }
      }
    }
  `;
  const result = await graphql.client.request(
    query,
    { input: { id, name, parentFolderId, workspaceId } },
    authorizationHeaders
  );
  return result;
};
