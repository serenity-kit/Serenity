import { gql } from "graphql-request";

type Params = {
  graphql: any;
  id: string;
  name: string;
  authorizationHeader: string;
};

export const updateFolderName = async ({
  graphql,
  id,
  name,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const query = gql`
        mutation {
            updateFolderName(
            input: {
              id: "${id}"
              name: "${name}"
            }
          ) {
            folder {
              name
              id
              parentFolderId
              rootFolderId
              workspaceId
            }
          }
        }
      `;
  const result = await graphql.client.request(
    query,
    null,
    authorizationHeaders
  );
  return result;
};
