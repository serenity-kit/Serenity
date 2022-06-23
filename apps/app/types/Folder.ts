export type Folder = {
  id: string;
  name: string;
  idSignature: string;
  parentFolderId: string | null;
  rootFolderId: string | null;
  workspaceId: string;
  parentFolders: Folder[] | null;
};
