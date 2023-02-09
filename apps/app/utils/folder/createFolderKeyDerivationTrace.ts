import { KeyDerivationTrace2, KeyDerivationTraceEntry } from "@naisho/core";
import { folderDerivedKeyContext } from "@serenity-tools/common";
import { Folder } from "../../generated/graphql";
import { getFolder } from "./getFolder";

export type Params = {
  folderId: string | undefined | null;
  workspaceKeyId: string;
};
export const createFolderKeyDerivationTrace = async ({
  folderId,
  workspaceKeyId,
}: Params): Promise<KeyDerivationTrace2> => {
  const trace: KeyDerivationTraceEntry[] = [];
  if (folderId) {
    let folder: Folder | undefined;
    let folderIdToFetch = folderId;
    do {
      folder = await getFolder({ id: folderIdToFetch });
      trace.unshift({
        entryId: folder.id,
        subkeyId: folder.keyDerivationTrace.subkeyId,
        parentId:
          folder.parentFolderId === null ? undefined : folder.parentFolderId,
        context: folderDerivedKeyContext,
      });
      if (folder.parentFolderId) {
        folderIdToFetch = folder.parentFolderId;
      }
    } while (folder.parentFolderId);
  }
  return {
    workspaceKeyId,
    trace,
  };
};
