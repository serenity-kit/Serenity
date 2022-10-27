import {
  Folder,
  KeyDerivationTraceParentFolder,
} from "../../generated/graphql";
import { getFolder } from "./getFolder";

export type Props = {
  folderId: string | undefined | null;
  workspaceKeyId: string;
};
export const buildKeyDerivationTrace = async ({
  folderId,
  workspaceKeyId,
}: Props) => {
  const folderKeyData: KeyDerivationTraceParentFolder[] = [];
  if (folderId) {
    let folder: Folder | undefined;
    let folderIdToFetch = folderId;
    do {
      folder = await getFolder({ id: folderIdToFetch });
      folderKeyData.push({
        folderId: folder.id,
        subkeyId: folder.subkeyId,
        parentFolderId: folder.parentFolderId,
      });
      if (folder.parentFolderId) {
        folderIdToFetch = folder.parentFolderId;
      }
    } while (folder.parentFolderId);
  }
  return {
    workspaceKeyId,
    parentFolders: folderKeyData,
  };
};
