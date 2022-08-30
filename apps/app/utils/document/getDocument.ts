import { Client } from "urql";
import {
  DocumentDocument,
  DocumentQuery,
  DocumentQueryVariables,
} from "../../generated/graphql";

export type Props = {
  documentId: string;
  urqlClient: Client;
};
export const getDocument = async ({ documentId, urqlClient }: Props) => {
  const documentResult = await urqlClient
    .query<DocumentQuery, DocumentQueryVariables>(
      DocumentDocument,
      { id: documentId },
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
      }
    )
    .toPromise();
  if (documentResult.error) {
    throw new Error(documentResult.error?.message);
  } else {
    return documentResult.data?.document;
  }
};
