import { gql } from "graphql-request";
import { buildFolderKeyTrace } from "../folder/buildFolderKeyTrace";

type Params = {
  graphql: any;
  id: string;
  parentFolderId: string | null;
  workspaceKeyId: string;
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

  const nameKeyDerivationTrace = await buildFolderKeyTrace({
    workspaceKeyId,
    parentFolderId,
  });

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
        nameKeyDerivationTrace,
      },
    },
    authorizationHeaders
  );
  return result;
};
