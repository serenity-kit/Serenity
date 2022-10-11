import { Snapshot } from "@naisho/core";
import { Document } from "../../types/document";
import { Folder } from "../../types/folder";
import { Workspace } from "../../types/workspace";
import { createSnapshot } from "../createSnapshot";
import { createFolder } from "../folder/createFolder";
import { prisma } from "../prisma";
import {
  createWorkspace,
  DeviceWorkspaceKeyBoxParams,
} from "./createWorkspace";

export type Params = {
  userId: string;
  workspaceId: string;
  workspaceName: string;
  folderId: string;
  folderIdSignature: string;
  encryptedFolderName: string;
  encryptedFolderNameNonce: string;
  folderSubkeyId: number;
  documentId: string;
  encryptedDocumentName: string;
  encryptedDocumentNameNonce: string;
  documentSubkeyId: number;
  documentContentSubkeyId: number;
  documentSnapshot: Snapshot;
  creatorDeviceSigningPublicKey: string;
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
  encryptedFolderName,
  encryptedFolderNameNonce,
  folderSubkeyId,
  documentId,
  encryptedDocumentName,
  encryptedDocumentNameNonce,
  documentSubkeyId,
  documentContentSubkeyId,
  documentSnapshot,
  creatorDeviceSigningPublicKey,
  deviceWorkspaceKeyBoxes,
}: Params): Promise<CreateWorkspaceResult> {
  const workspace = await createWorkspace({
    id: workspaceId,
    name: workspaceName,
    userId,
    creatorDeviceSigningPublicKey,
    deviceWorkspaceKeyBoxes,
  });
  const workspaceKey = workspace.currentWorkspaceKey;
  const folder = await createFolder({
    userId,
    id: folderId,
    encryptedName: encryptedFolderName,
    encryptedNameNonce: encryptedFolderNameNonce,
    workspaceKeyId: workspaceKey?.id!,
    subkeyId: folderSubkeyId,
    parentFolderId: undefined,
    workspaceId: workspace.id,
  });
  const document = await prisma.document.create({
    data: {
      id: documentId,
      encryptedName: encryptedDocumentName,
      encryptedNameNonce: encryptedDocumentNameNonce,
      workspaceKeyId: workspace.currentWorkspaceKey?.id,
      subkeyId: documentSubkeyId,
      contentSubkeyId: documentContentSubkeyId,
      parentFolderId: folder.id,
      workspaceId: workspaceId,
    },
  });
  await createSnapshot(documentSnapshot);
  return {
    workspace,
    document,
    folder,
  };
}
