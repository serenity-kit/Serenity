import { runDocumentQuery } from "../../generated/graphql";

export type Props = {
  documentId: string;
};
export const getDocument = async ({ documentId }: Props) => {
  const documentResult = await runDocumentQuery(
    { id: documentId },
    { requestPolicy: "network-only" }
  );
  if (documentResult.error) {
    throw new Error(documentResult.error?.message);
  }
  return documentResult.data?.document;
};
