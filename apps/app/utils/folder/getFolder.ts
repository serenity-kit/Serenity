import { Client } from "urql";
import {
  Folder,
  FolderDocument,
  FolderQuery,
  FolderQueryVariables,
} from "../../generated/graphql";

export type Props = {
  id: string;
  urqlClient: Client;
};
export const getFolder = async ({ id, urqlClient }: Props): Promise<Folder> => {
  const folderResult = await urqlClient
    .query<FolderQuery, FolderQueryVariables>(
      FolderDocument,
      { id },
      {
        requestPolicy: "network-only",
      }
    )
    .toPromise();
  if (folderResult.error) {
    throw new Error(folderResult.error.message);
  }
  if (!folderResult.data?.folder) {
    throw new Error("Error retrieving folder");
  }
  return folderResult.data?.folder;
};
