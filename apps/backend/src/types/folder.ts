export type Folder = {
  id: string;
  name: string;
  encryptedName?: string | null;
  nameNonce?: string | null;
  subKeyId?: number | null;
  idSignature: string;
  parentFolderId: string | null;
  rootFolderId: string | null;
  workspaceId: string;
  parentFolders: Folder[] | null;
};
