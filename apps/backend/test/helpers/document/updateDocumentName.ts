import { gql } from "graphql-request";

type Params = {
  graphql: any;
  id: string;
  name: string;
  authorizationHeader: string;
};

export const updateDocumentName = async ({
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
            updateDocumentName(
            input: {
              id: "${id}"
              name: "${name}"
            }
          ) {
            document {
              name
              id
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
