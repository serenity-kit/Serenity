import { WorkspaceKey } from "./workspace";

export type Document = {
  id: string;
  encryptedName?: string | null;
  encryptedNameNonce?: string | null;
  workspaceKey?: WorkspaceKey | null;
  parentFolderId: string | null;
  workspaceId: string;
  createdAt?: Date;
  updatedAt?: Date;
  subkeyId?: number | null;
};
