import { WorkspaceKey } from "./workspace";

export type Folder = {
  id: string;
  nameCiphertext: string;
  nameNonce: string;
  subkeyId: string;
  signature: string;
  parentFolderId: string | null;
  rootFolderId: string | null;
  workspaceId: string;
  parentFolders?: Folder[] | null;
  workspaceKeyId: string;
  workspaceKey?: WorkspaceKey | null;
};
