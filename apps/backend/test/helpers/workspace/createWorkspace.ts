import { gql } from "graphql-request";

type Params = {
  graphql: any;
  id: string;
  name: string;
  authorizationHeader: string;
};

export const createWorkspace = async ({
  graphql,
  name,
  id,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const query = gql`
    mutation {
      createWorkspace(
        input: {
          name: "${name}"
          id: "${id}"
        }
      ) {
        workspace {
          id
          name
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
