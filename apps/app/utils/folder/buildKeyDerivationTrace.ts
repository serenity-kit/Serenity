import {
  Folder,
  KeyDerivationTraceParentFolder,
} from "../../generated/graphql";
import { getFolder } from "./getFolder";

export type Props = {
  folderId: string;
  workspaceKeyId: string;
};
export const buildKeyDerivationTrace = async ({
  folderId,
  workspaceKeyId,
}: Props) => {
  const folderKeyData: KeyDerivationTraceParentFolder[] = [];
  let folder: Folder | undefined;
  do {
    folder = await getFolder({ id: folderId });
    folderKeyData.push({
      folderId: folder.id,
      subkeyId: folder.subkeyId,
      parentFolderId: folder.parentFolderId,
    });
  } while (folder.parentFolderId);
  return {
    workspaceKeyId,
    parentFolders: folderKeyData,
  };
};
