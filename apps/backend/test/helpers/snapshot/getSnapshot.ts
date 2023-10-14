import { gql } from "graphql-request";

type Params = {
  graphql: any;
  documentId: string;
  documentShareLinkToken?: string | undefined | null;
  authorizationHeader: string;
};

export const getSnapshot = async ({
  graphql,
  documentId,
  documentShareLinkToken,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const query = gql`
    query snapshot($documentId: ID!) {
      snapshot(documentId: $documentId) {
        id
        data
        documentId
        keyDerivationTrace {
          workspaceKeyId
          trace {
            entryId
            subkeyId
            parentId
            context
          }
        }
      }
    }
  `;
  const result = await graphql.client.request(
    query,
    { documentId, documentShareLinkToken },
    authorizationHeaders
  );
  return result;
};
