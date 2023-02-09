import { gql } from "graphql-request";

type Params = {
  graphql: any;
  commentIds: string[];
  authorizationHeader: string;
};

export const deleteComments = async ({
  graphql,
  commentIds,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const query = gql`
    mutation deleteComments($input: DeleteCommentsInput!) {
      deleteComments(input: $input) {
        status
      }
    }
  `;
  const result = await graphql.client.request(
    query,
    {
      input: {
        commentIds,
      },
    },
    authorizationHeaders
  );
  return result;
};
