import { Folder, runFolderTraceQuery } from "../../generated/graphql";

export type Props = {
  folderId: string;
};
export const getFolderTrace = async ({
  folderId,
}: Props): Promise<Folder[]> => {
  // the first element is the root folder
  // the last element is the folder withid == folderId
  const folderTraceResult = await runFolderTraceQuery({
    folderId,
  });
  if (folderTraceResult.error) {
    throw new Error(
      folderTraceResult.error.message || "Error retrieving folderTrace"
    );
  }
  const folderTrace = folderTraceResult.data?.folderTrace;
  if (!folderTrace) {
    throw new Error("Error retrieving folderTrace");
  }
  return folderTrace;
};
