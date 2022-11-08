import { Snapshot } from "@naisho/core";
import { Document, formatDocument } from "../../types/document";
import { Folder, formatFolder, KeyDerivationTrace } from "../../types/folder";
import { Workspace } from "../../types/workspace";
import { createSnapshot } from "../createSnapshot";
import { createFolder } from "../folder/createFolder";
import { prisma } from "../prisma";
import {
  createWorkspace,
  DeviceWorkspaceKeyBoxParams,
} from "./createWorkspace";

export type InitialWorkspaceParams = {
  id: string;
  name: string;
  creatorDeviceSigningPublicKey: string;
  deviceWorkspaceKeyBoxes: DeviceWorkspaceKeyBoxParams[];
};

export type InitialWorkspaceFolderParams = {
  id: string;
  idSignature: string;
  encryptedName: string;
  encryptedNameNonce: string;
  subkeyId: number;
};

export type InitialWorkspaceDocumentParams = {
  id: string;
  encryptedName: string;
  encryptedNameNonce: string;
  subkeyId: number;
  snapshot: Snapshot;
};

export type Params = {
  userId: string;
  workspace: InitialWorkspaceParams;
  folder: InitialWorkspaceFolderParams;
  document: InitialWorkspaceDocumentParams;
};

export type CreateWorkspaceResult = {
  workspace: Workspace;
  document: Document;
  folder: Folder;
};

export async function createInitialWorkspaceStructure({
  userId,
  workspace,
  folder,
  document,
}: Params): Promise<CreateWorkspaceResult> {
  const createdWorkspace = await createWorkspace({
    id: workspace.id,
    name: workspace.name,
    userId,
    creatorDeviceSigningPublicKey: workspace.creatorDeviceSigningPublicKey,
    deviceWorkspaceKeyBoxes: workspace.deviceWorkspaceKeyBoxes,
  });
  const workspaceKey = createdWorkspace.currentWorkspaceKey;
  const createdFolder = await createFolder({
    userId,
    id: folder.id,
    encryptedName: folder.encryptedName,
    encryptedNameNonce: folder.encryptedNameNonce,
    workspaceKeyId: workspaceKey?.id!,
    subkeyId: folder.subkeyId,
    parentFolderId: undefined,
    workspaceId: createdWorkspace.id,
    keyDerivationTrace: {
      workspaceKeyId: workspaceKey?.id!,
      parentFolders: [],
    },
  });
  const createdDocument = await prisma.document.create({
    data: {
      id: document.id,
      encryptedName: document.encryptedName,
      encryptedNameNonce: document.encryptedNameNonce,
      workspaceKeyId: createdWorkspace.currentWorkspaceKey?.id,
      subkeyId: document.subkeyId,
      parentFolderId: folder.id,
      workspaceId: createdWorkspace.id,
      nameKeyDerivationTrace: {
        workspaceKeyId: workspaceKey?.id!,
        parentFolders: [],
      },
    },
  });
  const snapshotKeyDerivationTrace: KeyDerivationTrace = {
    workspaceKeyId: workspaceKey?.id!,
    parentFolders: [
      {
        folderId: folder.id,
        parentFolderId: null,
        subkeyId: folder.subkeyId,
      },
    ],
  };
  const fullDocumentSnapshot = {
    ...document.snapshot,
    keyDerivationTrace: snapshotKeyDerivationTrace,
  };
  await createSnapshot(fullDocumentSnapshot);
  return {
    workspace: createdWorkspace,
    document: formatDocument(createdDocument),
    folder: formatFolder(createdFolder),
  };
}
