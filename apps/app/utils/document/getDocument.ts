import { runDocumentQuery } from "../../generated/graphql";

export type Props = {
  documentId: string;
};
export const getDocument = async ({ documentId }: Props) => {
  const documentResult = await runDocumentQuery(
    {
      id: documentId,
    },
    { requestPolicy: "network-only" }
  );
  if (!documentResult.data?.document) {
    throw new Error(documentResult.error?.message || "Document not found");
  }
  const document = documentResult.data.document;
  return document;
};
