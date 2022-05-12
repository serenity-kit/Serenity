import { gql } from "graphql-request";

type Params = {
  graphql: any;
  id: string;
  workspaceId: string;
  authorizationHeader: string;
};

export const createDocument = async ({
  graphql,
  id,
  workspaceId,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const query = gql`
    mutation {
      createDocument(
        input: {
          id: "${id}"
          workspaceId: "${workspaceId}"
        }
      ) {
        id
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
