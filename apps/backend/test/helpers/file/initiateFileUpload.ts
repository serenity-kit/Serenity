import { gql } from "graphql-request";
import { TestContext } from "../setupGraphql";

type Props = {
  graphql: TestContext;
  workspaceId: string;
  documentId: string;
  authorization: string;
};
export const initateFileUpload = async ({
  graphql,
  documentId,
  workspaceId,
  authorization,
}: Props) => {
  const query = gql`
    mutation initiateFileUpload($input: InitiateFileUploadInput!) {
      initiateFileUpload(input: $input) {
        fileId
        uploadUrl
      }
    }
  `;
  return graphql.client.request(
    query,
    { input: { documentId, workspaceId } },
    { authorization }
  );
};
