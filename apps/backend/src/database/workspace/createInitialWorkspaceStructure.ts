import * as documentChain from "@serenity-kit/document-chain";
import * as workspaceChain from "@serenity-kit/workspace-chain";
import * as workspaceMemberDevicesProofUtil from "@serenity-kit/workspace-member-devices-proof";
import {
  KeyDerivationTrace,
  SerenitySnapshotWithClientData,
  verifyFolderNameSignature,
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
  infoSignature: string;
  deviceWorkspaceKeyBoxes: DeviceWorkspaceKeyBoxParams[];
  workspaceKeyId: string;
};

export type FolderParams = {
  id: string;
  signature: string;
  nameCiphertext: string;
  nameNonce: string;
  keyDerivationTrace: KeyDerivationTrace;
};

export type DocumentParams = {
  nameCiphertext: string;
  nameNonce: string;
  subkeyId: string;
  snapshot: SerenitySnapshotWithClientData;
};

export type Params = {
  userId: string;
  workspace: WorkspaceParams;
  workspaceChainEvent: workspaceChain.CreateChainWorkspaceChainEvent;
  folder: FolderParams;
  document: DocumentParams;
  userMainDeviceSigningPublicKey: string;
  creatorDeviceSigningPublicKey: string;
  documentChainEvent: documentChain.CreateDocumentChainEvent;
  workspaceMemberDevicesProof: workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProof;
};

// TODO run all of these operations in a transaction
export async function createInitialWorkspaceStructure({
  userId,
  workspace,
  workspaceChainEvent,
  folder,
  document,
  creatorDeviceSigningPublicKey,
  userMainDeviceSigningPublicKey,
  documentChainEvent,
  workspaceMemberDevicesProof,
}: Params) {
  const validSignatureForMainDevice = verifyFolderNameSignature({
    ciphertext: folder.nameCiphertext,
    nonce: folder.nameNonce,
    signature: folder.signature,
    authorSigningPublicKey: creatorDeviceSigningPublicKey,
    folderId: folder.id,
    workspaceId: workspace.id,
    workspaceMemberDevicesProof,
    keyDerivationTrace: folder.keyDerivationTrace,
  });
  if (!validSignatureForMainDevice) {
    throw new Error("Invalid signature");
  }

  const createdWorkspace = await createWorkspace({
    id: workspace.id,
    infoCiphertext: workspace.infoCiphertext,
    infoNonce: workspace.infoNonce,
    userId,
    creatorDeviceSigningPublicKey,
    userMainDeviceSigningPublicKey,
    deviceWorkspaceKeyBoxes: workspace.deviceWorkspaceKeyBoxes,
    workspaceKeyId: workspace.workspaceKeyId,
    workspaceChainEvent,
    workspaceMemberDevicesProof,
    infoSignature: workspace.infoSignature,
  });
  const workspaceKey = createdWorkspace.currentWorkspaceKey;
  const createdFolder = await createFolder({
    userId,
    id: folder.id,
    nameCiphertext: folder.nameCiphertext,
    nameNonce: folder.nameNonce,
    signature: folder.signature,
    workspaceMemberDevicesProofHash: workspaceMemberDevicesProof.hash,
    workspaceKeyId: workspaceKey?.id!,
    subkeyId: "yoW4QaCRujrMdml7q39EqQ", // TODO: remove
    parentFolderId: undefined,
    workspaceId: createdWorkspace.id,
    keyDerivationTrace: folder.keyDerivationTrace,
    authorDeviceSigningPublicKey: creatorDeviceSigningPublicKey,
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
