import { KeyDerivationTrace } from "@naisho/core";
import { WorkspaceKey } from "./workspace";

export type Folder = {
  id: string;
  encryptedName: string;
  encryptedNameNonce: string;
  idSignature: string;
  parentFolderId: string | null;
  rootFolderId: string | null;
  workspaceId: string;
  workspaceKey?: WorkspaceKey | null;
  parentFolders: Folder[] | null;
  keyDerivationTrace: KeyDerivationTrace;
};

export const formatFolder = (folder: any): Folder => {
  return {
    ...folder,
    keyDerivationTrace: folder.keyDerivationTrace as KeyDerivationTrace,
  };
};
