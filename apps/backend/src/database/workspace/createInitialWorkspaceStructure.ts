import { KeyDerivationTrace, Snapshot } from "@naisho/core";
import { Snapshot as SnapshotModel } from "../../../prisma/generated/output";
import { Document, formatDocument } from "../../types/document";
import { Folder, formatFolder } from "../../types/folder";
import { Workspace } from "../../types/workspace";
import { createSnapshot } from "../createSnapshot";
import { createFolder } from "../folder/createFolder";
import { prisma } from "../prisma";
import {
  createWorkspace,
  DeviceWorkspaceKeyBoxParams,
} from "./createWorkspace";

export type CreateWorkspaceResult = {
  workspace: Workspace;
  document: Document;
  folder: Folder;
  snapshot: SnapshotModel;
};

export type WorkspaceParams = {
  id: string;
  name: string;
  deviceWorkspaceKeyBoxes: DeviceWorkspaceKeyBoxParams[];
  workspaceKeyId: string;
};

export type FolderParams = {
  id: string;
  idSignature: string;
  encryptedName: string;
  encryptedNameNonce: string;
  keyDerivationTrace: KeyDerivationTrace;
};

export type DocumentParams = {
  id: string;
  encryptedName: string;
  encryptedNameNonce: string;
  nameKeyDerivationTrace: KeyDerivationTrace;
  snapshot: Snapshot;
};

export type Params = {
  userId: string;
  workspace: WorkspaceParams;
  folder: FolderParams;
  document: DocumentParams;
  creatorDeviceSigningPublicKey: string;
};

export async function createInitialWorkspaceStructure({
  userId,
  workspace,
  folder,
  document,
  creatorDeviceSigningPublicKey,
}: Params): Promise<CreateWorkspaceResult> {
  const createdWorkspace = await createWorkspace({
    id: workspace.id,
    name: workspace.name,
    userId,
    creatorDeviceSigningPublicKey,
    deviceWorkspaceKeyBoxes: workspace.deviceWorkspaceKeyBoxes,
    workspaceKeyId: workspace.workspaceKeyId,
  });
  const workspaceKey = createdWorkspace.currentWorkspaceKey;
  const createdFolder = await createFolder({
    userId,
    id: folder.id,
    encryptedName: folder.encryptedName,
    encryptedNameNonce: folder.encryptedNameNonce,
    workspaceKeyId: workspaceKey?.id!,
    subkeyId: 123, // TODO: remove
    parentFolderId: undefined,
    workspaceId: createdWorkspace.id,
    keyDerivationTrace: folder.keyDerivationTrace,
  });

  const createdDocument = await prisma.document.create({
    data: {
      id: document.id,
      encryptedName: document.encryptedName,
      encryptedNameNonce: document.encryptedNameNonce,
      workspaceKeyId: createdWorkspace.currentWorkspaceKey?.id,
      subkeyId: 123, // TODO: remove
      parentFolderId: folder.id,
      workspaceId: createdWorkspace.id,
      nameKeyDerivationTrace: document.nameKeyDerivationTrace,
    },
  });

  const snapshot = await createSnapshot({ snapshot: document.snapshot });
  return {
    workspace: createdWorkspace,
    document: formatDocument(createdDocument),
    folder: formatFolder(createdFolder),
    snapshot,
  };
}
