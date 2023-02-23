import {
  KeyDerivationTrace,
  KeyDerivationTraceParentFolder,
} from "@naisho/core";
import { getFolderTrace } from "../folder/getFolderTrace";

export type Params = {
  folderId: string;
  subkeyId: number;
  workspaceKeyId: string;
};
export const createDocumentKeyDerivationTrace = async ({
  folderId,
  subkeyId,
  workspaceKeyId,
}: Params): Promise<KeyDerivationTrace> => {
  // TODO: derive document key from the snapshot key
  let trace: KeyDerivationTraceParentFolder[] = [];
  const folderTrace = await getFolderTrace({ folderId });
  folderTrace.forEach((folder) => {
    if (folder.keyDerivationTrace.trace.length > 0) {
      const folderSubkeyId =
        folder.keyDerivationTrace.trace[
          folder.keyDerivationTrace.trace.length - 1
        ].subkeyId;
      trace.push({
        folderId: folder.id,
        subkeyId: folderSubkeyId,
        parentFolderId: folder.parentFolderId,
      });
    }
  });
  return {
    workspaceKeyId,
    subkeyId,
    parentFolders: trace,
  };
};
