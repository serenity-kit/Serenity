import { createWorkspace } from "./createWorkspace";
import { createFolder } from "../folder/createFolder";
import { Workspace } from "../../types/workspace";
import { Document } from "../../types/document";
import { Folder } from "../../types/folder";

export type Params = {
  userId: string;
  workspaceId: string;
  workspaceName: string;
  folderId: string;
  folderIdSignature: string;
  folderName: string;
  documentId: string;
  documentName: string;
};

export type CreateWorkspaceResult = {
  workspace: Workspace;
  document?: Document;
  folder: Folder;
};

export async function createInitialWorkspaceStructure({
  userId,
  workspaceId,
  workspaceName,
  folderId,
  folderName,
}: Params): Promise<CreateWorkspaceResult> {
  const workspace = await createWorkspace({
    id: workspaceId,
    name: workspaceName,
    userId,
  });
  const folder = await createFolder({
    userId,
    id: folderId,
    name: folderName,
    parentFolderId: undefined,
    workspaceId: workspace.id,
  });
  const document = undefined;
  // const document = await createDocument({
  //   id: uuidv4(),
  //   name: "Introduction",
  //   parentFolderId: folder.id,
  //   workspaceId: workspaceId,
  // });
  // TODO: insert document snapshot to include title and text content
  return {
    workspace,
    document,
    folder,
  };
}
