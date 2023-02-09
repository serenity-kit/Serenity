import { gql } from "graphql-request";

type Params = {
  graphql: any;
  commentReplyIds: string[];
  authorizationHeader: string;
};

export const deleteCommentReplies = async ({
  graphql,
  commentReplyIds,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const query = gql`
    mutation deleteCommentReplies($input: DeleteCommentRepliesInput!) {
      deleteCommentReplies(input: $input) {
        status
      }
    }
  `;
  const result = await graphql.client.request(
    query,
    {
      input: {
        commentReplyIds,
      },
    },
    authorizationHeaders
  );
  return result;
};
