import { gql } from "graphql-request";

type Params = {
  graphql: any;
  commentIds: string[];
  documentShareLinkToken?: string | null | undefined;
  authorizationHeader: string;
};

export const deleteComments = async ({
  graphql,
  commentIds,
  documentShareLinkToken,
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
        documentShareLinkToken,
      },
    },
    authorizationHeaders
  );
  return result;
};
