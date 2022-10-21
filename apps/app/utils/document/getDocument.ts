import {
  DocumentDocument,
  DocumentQuery,
  DocumentQueryVariables,
} from "../../generated/graphql";
import { getUrqlClient } from "../urqlClient/urqlClient";

export type Props = {
  documentId: string;
};
export const getDocument = async ({ documentId }: Props) => {
  const documentResult = await getUrqlClient()
    .query<DocumentQuery, DocumentQueryVariables>(
      DocumentDocument,
      { id: documentId },
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
      }
    )
    .toPromise();
  console.log({ documentResult });
  if (documentResult.error) {
    throw new Error(documentResult.error?.message);
  } else {
    return documentResult.data?.document;
  }
};
