import { gql } from "graphql-request";

type Params = {
  graphql: any;
  ids: string[];
  authorizationHeader: string;
};

export const deleteDocuments = async ({
  graphql,
  ids,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const query = gql`
        mutation {
          deleteDocuments(
            input: {
              ids: "${ids}"
            }
          ) {
            status
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
