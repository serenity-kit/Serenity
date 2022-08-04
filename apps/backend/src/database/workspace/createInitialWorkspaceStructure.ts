import {
  createWorkspace,
  DeviceWorkspaceKeyBoxParams,
} from "./createWorkspace";
import { createFolder } from "../folder/createFolder";
import { Workspace } from "../../types/workspace";
import { Document } from "../../types/document";
import { Folder } from "../../types/folder";
import { Snapshot } from "@naisho/core";
import { createDocument } from "../document/createDocument";
import { createSnapshot } from "../createSnapshot";

export type Params = {
  userId: string;
  workspaceId: string;
  workspaceName: string;
  folderId: string;
  folderIdSignature: string;
  folderName: string;
  documentId: string;
  documentName: string;
  documentSnapshot: Snapshot;
  deviceWorkspaceKeyBoxes: DeviceWorkspaceKeyBoxParams[];
};

export type CreateWorkspaceResult = {
  workspace: Workspace;
  document: Document;
  folder: Folder;
};

export async function createInitialWorkspaceStructure({
  userId,
  workspaceId,
  workspaceName,
  folderId,
  folderName,
  documentId,
  documentName,
  documentSnapshot,
  deviceWorkspaceKeyBoxes,
}: Params): Promise<CreateWorkspaceResult> {
  const workspace = await createWorkspace({
    id: workspaceId,
    name: workspaceName,
    userId,
    deviceWorkspaceKeyBoxes,
  });
  const folder = await createFolder({
    userId,
    id: folderId,
    name: folderName,
    parentFolderId: undefined,
    workspaceId: workspace.id,
  });
  const document = await createDocument({
    id: documentId,
    name: documentName,
    parentFolderId: folder.id,
    workspaceId: workspaceId,
  });
  await createSnapshot(documentSnapshot);
  return {
    workspace,
    document,
    folder,
  };
}
