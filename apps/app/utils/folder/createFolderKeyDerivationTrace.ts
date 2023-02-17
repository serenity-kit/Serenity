import { KeyDerivationTrace2, KeyDerivationTraceEntry } from "@naisho/core";
import { folderDerivedKeyContext } from "@serenity-tools/common";
import { getFolderTrace } from "./getFolderTrace";

export type Params = {
  folderId: string | undefined | null;
  workspaceKeyId: string;
};
export const createFolderKeyDerivationTrace = async ({
  folderId,
  workspaceKeyId,
}: Params): Promise<KeyDerivationTrace2> => {
  let trace: KeyDerivationTraceEntry[] = [];
  if (folderId) {
    const folderTrace = await getFolderTrace({ folderId });
    folderTrace.forEach((folder) => {
      const subkeyId = folder.keyDerivationTrace.subkeyId;
      trace.push({
        entryId: folder.id,
        subkeyId,
        parentId: folder.parentFolderId,
        context: folderDerivedKeyContext,
      });
    });
  }
  return {
    workspaceKeyId,
    trace,
  };
};
