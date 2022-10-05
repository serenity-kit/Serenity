import {
  Folder,
  FolderDocument,
  FolderQuery,
  FolderQueryVariables,
} from "../../generated/graphql";
import { getUrqlClient } from "../urqlClient/urqlClient";

export type Props = {
  id: string;
};
export const getFolder = async ({ id }: Props): Promise<Folder> => {
  const folderResult = await getUrqlClient()
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
