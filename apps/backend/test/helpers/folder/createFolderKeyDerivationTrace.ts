import { KeyDerivationTrace, KeyDerivationTraceEntry } from "@naisho/core";
import { folderDerivedKeyContext } from "@serenity-tools/common";
import { prisma } from "../../../src/database/prisma";

export type Params = {
  workspaceKeyId: string;
  parentFolderId: string | null | undefined;
};
export const createFolderKeyDerivationTrace = async ({
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
  const parentFolderKeyDerivationTrace: KeyDerivationTraceEntry[] = [];
  // recursively trace parent folder keys
  let tracedParentFolderId = parentFolderId;
  while (tracedParentFolderId !== null && tracedParentFolderId !== undefined) {
    const parentFolder = folderLookup[tracedParentFolderId];
    if (parentFolder) {
      parentFolderKeyDerivationTrace.unshift({
        entryId: tracedParentFolderId,
        subkeyId: parentFolder.subkeyId,
        parentId: null,
        context: folderDerivedKeyContext,
      });
      tracedParentFolderId = parentFolder.parentFolderId;
    } else {
      tracedParentFolderId = undefined;
    }
  }
  const keyDerivationTrace: KeyDerivationTrace = {
    workspaceKeyId,
    trace: parentFolderKeyDerivationTrace,
  };
  return keyDerivationTrace;
};
