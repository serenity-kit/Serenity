export type Folder = {
  id: string;
  name?: string;
  encryptedName?: string;
  encryptedNameNonce?: string;
  subkeyId?: number;
  idSignature?: string;
  parentFolderId: string | null;
  rootFolderId: string | null;
  workspaceId: string;
  parentFolders?: Folder[] | null;
};
