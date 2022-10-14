import { prisma } from "../../../src/database/prisma";
import {
  KeyDerivationTrace,
  KeyDerivationTraceParentFolder,
} from "../../../src/types/folder";

export type Params = {
  workspaceKeyId: string;
  parentFolderId: string | null | undefined;
};
export const buildFolderKeyTrace = async ({
  workspaceKeyId,
  parentFolderId,
}: Params): Promise<KeyDerivationTrace> => {
  const workspaceKey = await prisma.workspaceKey.findFirst({
    where: {
      id: workspaceKeyId,
    },
  });
  if (!workspaceKey) {
    throw new Error("Workspace key not found");
  }
  const workspaceId = workspaceKey.workspaceId;
  const allFolders = await prisma.folder.findMany({
    where: { workspaceId },
  });
  const folderLookup: { [id: string]: any } = {};
  allFolders.forEach((folder) => {
    folderLookup[folder.id] = folder;
  });
  const parentFolderKeyDerivationTrace: KeyDerivationTraceParentFolder[] = [];
  // recursively trace parent folder keys
  let tracedParentFolderId = parentFolderId;
  while (tracedParentFolderId !== null && tracedParentFolderId !== undefined) {
    const parentFolder = folderLookup[tracedParentFolderId];
    if (parentFolder) {
      parentFolderKeyDerivationTrace.push({
        folderId: tracedParentFolderId,
        subkeyId: parentFolder.subkeyId,
        parentFolderId: null,
      });
      tracedParentFolderId = parentFolder.parentFolderId;
    } else {
      tracedParentFolderId = undefined;
    }
  }
  const keyDerivationTrace: KeyDerivationTrace = {
    workspaceKeyId,
    parentFolders: parentFolderKeyDerivationTrace,
  };
  return keyDerivationTrace;
};
