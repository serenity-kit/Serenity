import { KeyDerivationTrace, KeyDerivationTrace2 } from "@naisho/core";
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
  keyDerivationTrace: KeyDerivationTrace2;
};

export const formatFolder = (folder: any): Folder => {
  return {
    ...folder,
    keyDerivationTrace: folder.keyDerivationTrace as KeyDerivationTrace,
  };
};
