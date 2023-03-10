import { WorkspaceKey } from "./workspace";

export type Document = {
  id: string;
  nameCiphertext: string;
  nameNonce: string;
  workspaceKey?: WorkspaceKey | null;
  parentFolderId: string | null;
  workspaceId: string;
  createdAt?: Date;
  updatedAt?: Date;
  subkeyId: number;
};
