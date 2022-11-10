import { gql } from "graphql-request";

export type Params = {
  graphql: any;
  token: string;
  authorizationHeader: string;
};

export const removeDocumentShareLink = async ({
  graphql,
  token,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const query = gql`
    mutation removeDocumentShareLink($input: RemoveDocumentShareLinkInput!) {
      removeDocumentShareLink(input: $input) {
        success
      }
    }
  `;
  const result = await graphql.client.request(
    query,
    {
      input: {
        token,
      },
    },
    authorizationHeaders
  );
  return result;
};
