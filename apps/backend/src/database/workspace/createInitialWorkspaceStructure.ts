import * as documentChain from "@serenity-kit/document-chain";
import * as workspaceChain from "@serenity-kit/workspace-chain";
import {
  KeyDerivationTrace,
  SerenitySnapshotWithClientData,
} from "@serenity-tools/common";
import { formatFolder } from "../../types/folder";
import { createDocument } from "../document/createDocument";
import { createFolder } from "../folder/createFolder";
import {
  DeviceWorkspaceKeyBoxParams,
  createWorkspace,
} from "./createWorkspace";

export type WorkspaceParams = {
  id: string;
  infoCiphertext: string;
  infoNonce: string;
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
  nameCiphertext: string;
  nameNonce: string;
  subkeyId: number;
  snapshot: SerenitySnapshotWithClientData;
};

export type Params = {
  userId: string;
  workspace: WorkspaceParams;
  workspaceChainEvent: workspaceChain.CreateChainWorkspaceChainEvent;
  folder: FolderParams;
  document: DocumentParams;
  creatorDeviceSigningPublicKey: string;
  documentChainEvent: documentChain.CreateDocumentChainEvent;
};

// TODO run all of these operations in a transaction
export async function createInitialWorkspaceStructure({
  userId,
  workspace,
  workspaceChainEvent,
  folder,
  document,
  creatorDeviceSigningPublicKey,
  documentChainEvent,
}: Params) {
  const createdWorkspace = await createWorkspace({
    id: workspace.id,
    infoCiphertext: workspace.infoCiphertext,
    infoNonce: workspace.infoNonce,
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

  const { document: createdDocument, snapshot } = await createDocument({
    userId,
    nameCiphertext: document.nameCiphertext,
    nameNonce: document.nameNonce,
    workspaceKeyId: createdWorkspace.currentWorkspaceKey?.id,
    subkeyId: document.subkeyId,
    parentFolderId: folder.id,
    workspaceId: createdWorkspace.id,
    snapshot: document.snapshot,
    documentChainEvent,
  });

  return {
    workspace: createdWorkspace,
    document: createdDocument,
    folder: formatFolder(createdFolder),
    snapshot,
  };
}
