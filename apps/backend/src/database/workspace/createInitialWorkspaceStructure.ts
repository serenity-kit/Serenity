import * as workspaceChain from "@serenity-kit/workspace-chain";
import { KeyDerivationTrace, SerenitySnapshot } from "@serenity-tools/common";
import { Document } from "../../types/document";
import { Folder, formatFolder } from "../../types/folder";
import {
  Snapshot as SnapshotModel,
  formatSnapshot,
} from "../../types/snapshot";
import { Workspace } from "../../types/workspace";
import { createSnapshot } from "../createSnapshot";
import { createFolder } from "../folder/createFolder";
import { prisma } from "../prisma";
import {
  DeviceWorkspaceKeyBoxParams,
  createWorkspace,
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
  nameCiphertext: string;
  nameNonce: string;
  keyDerivationTrace: KeyDerivationTrace;
};

export type DocumentParams = {
  id: string;
  nameCiphertext: string;
  nameNonce: string;
  subkeyId: number;
  snapshot: SerenitySnapshot;
};

export type Params = {
  userId: string;
  workspace: WorkspaceParams;
  workspaceChainEvent: workspaceChain.CreateChainWorkspaceChainEvent;
  folder: FolderParams;
  document: DocumentParams;
  creatorDeviceSigningPublicKey: string;
};

export async function createInitialWorkspaceStructure({
  userId,
  workspace,
  workspaceChainEvent,
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
    workspaceChainEvent,
  });
  const workspaceKey = createdWorkspace.currentWorkspaceKey;
  const createdFolder = await createFolder({
    userId,
    id: folder.id,
    nameCiphertext: folder.nameCiphertext,
    nameNonce: folder.nameNonce,
    workspaceKeyId: workspaceKey?.id!,
    subkeyId: 123, // TODO: remove
    parentFolderId: undefined,
    workspaceId: createdWorkspace.id,
    keyDerivationTrace: folder.keyDerivationTrace,
  });

  const createdDocument = await prisma.document.create({
    data: {
      id: document.id,
      nameCiphertext: document.nameCiphertext,
      nameNonce: document.nameNonce,
      workspaceKeyId: createdWorkspace.currentWorkspaceKey?.id,
      subkeyId: document.subkeyId,
      parentFolderId: folder.id,
      workspaceId: createdWorkspace.id,
    },
  });

  const snapshot = await createSnapshot({
    snapshot: document.snapshot,
    workspaceId: createdWorkspace.id,
  });
  return {
    workspace: createdWorkspace,
    document: createdDocument,
    folder: formatFolder(createdFolder),
    snapshot: formatSnapshot(snapshot),
  };
}
