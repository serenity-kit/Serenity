export type Document = {
  id: string;
  name?: string | null;
  encryptedName?: string | null;
  encryptedNameNonce?: string | null;
  subkeyId?: number | null;
  parentFolderId: string | null;
  workspaceId: string;
  createdAt?: Date;
  updatedAt?: Date;
};
