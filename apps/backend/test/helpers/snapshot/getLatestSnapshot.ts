import { TestContext } from "../setupGraphql";

export type Props = {
  graphql: TestContext;
  documentId: string;
  authorizationHeader: string;
};
export const getLatestSnapshot = async ({
  graphql,
  documentId,
  authorizationHeader,
}: Props) => {
  const authorizationHeaders = { authorization: authorizationHeader };
  const query = `
    query latestSnapshot($documentId: ID!) {
      latestSnapshot(documentId: $documentId) {
        snapshot {
          id
          latestVersion
          data
          preview
          documentId
          keyDerivationTrace {
            workspaceKeyId
            parentFolders {
              folderId
              parentFolderId
              subkeyId
            }
          }
        }
      }
    }
    `;
  const result = await graphql.client.request(
    query,
    {
      documentId,
    },
    authorizationHeaders
  );
  return result;
};
