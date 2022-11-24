import { gql } from "graphql-request";

type Params = {
  graphql: any;
  id: string;
  parentFolderId: string | null;
  workspaceKeyId: string; // TODO: remove this param
  workspaceId: string;
  contentSubkeyId: number;
  authorizationHeader: string;
};

export const createDocument = async ({
  graphql,
  id,
  parentFolderId,
  workspaceId,
  workspaceKeyId,
  contentSubkeyId,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const query = gql`
    mutation createDocument($input: CreateDocumentInput!) {
      createDocument(input: $input) {
        id
      }
    }
  `;
  const result = await graphql.client.request(
    query,
    {
      input: {
        id,
        parentFolderId,
        workspaceId,
        contentSubkeyId,
      },
    },
    authorizationHeaders
  );
  return result;
};
