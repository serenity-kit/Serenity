import { gql } from "graphql-request";
import { TestContext } from "../setupGraphql";

export type Props = {
  graphql: TestContext;
  workspaceId: string;
  first: number;
  authorizationHeader: string;
};
export const getRootFolders = async ({
  graphql,
  workspaceId,
  first,
  authorizationHeader,
}: Props) => {
  const query = gql`
    query rootFolders($workspaceId: ID!, $first: Int!) {
      rootFolders(workspaceId: $workspaceId, first: $first) {
        edges {
          node {
            id
            parentFolderId
            rootFolderId
            workspaceId
            nameCiphertext
            nameNonce
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
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;
  const result = await graphql.client.request<any>(
    query,
    {
      workspaceId,
      first,
    },
    { authorization: authorizationHeader }
  );
  return result;
};
