import { WorkspaceKey } from "./workspace";

export type Document = {
  id: string;
  encryptedName?: string | null;
  encryptedNameNonce?: string | null;
  workspaceKeyId?: string | null;
  workspaceKey?: WorkspaceKey | null;
  subkeyId?: number | null;
  contentSubkeyId?: number | null;
  parentFolderId: string | null;
  workspaceId: string;
  createdAt?: Date;
  updatedAt?: Date;
};
