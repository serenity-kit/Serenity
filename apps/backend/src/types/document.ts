export type Document = {
  id: string;
  name: string;
  parentFolderId: string | null;
  workspaceId: string;
  createdAt?: Date;
  updatedAt?: Date;
};
