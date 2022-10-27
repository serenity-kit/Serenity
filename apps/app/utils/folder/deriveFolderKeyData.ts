import { folderDerivedKeyContext } from "@serenity-tools/common";
import { kdfDeriveFromKey } from "@serenity-tools/common/src/kdfDeriveFromKey/kdfDeriveFromKey";
import { Device } from "../../types/Device";
import { deriveWorkspaceKey } from "../workspace/deriveWorkspaceKey";
import { getWorkspace } from "../workspace/getWorkspace";
import { getFolder } from "./getFolder";

export type GetParentFolderKeyProps = {
  folderId: string;
  workspaceId: string;
  workspaceKeyId?: string;
  activeDevice: Device;
};
export const deriveParentFolderKey = async ({
  folderId,
  workspaceId,
  workspaceKeyId,
  activeDevice,
}: GetParentFolderKeyProps) => {
  let usingWorkspaceKeyId = workspaceKeyId;
  if (!usingWorkspaceKeyId) {
    const workspace = await getWorkspace({
      workspaceId,
      deviceSigningPublicKey: activeDevice.signingPublicKey,
    });
    if (!workspace?.currentWorkspaceKey?.id) {
      throw new Error("Workspace key not found");
    }
    usingWorkspaceKeyId = workspace.currentWorkspaceKey.id;
  }
  let keyData = {
    key: "",
    subkeyId: -1,
  };
  const folder = await getFolder({
    id: folderId,
  });
  let keyChain: any[] = [];
  if (folder.parentFolderId) {
    const parentFolderKeyData = await deriveFolderKey({
      folderId: folder.parentFolderId,
      workspaceKeyId: usingWorkspaceKeyId,
      workspaceId: workspaceId,
      activeDevice,
    });
    keyData = parentFolderKeyData.folderKeyData;
    keyChain = parentFolderKeyData.keyChain;
    if (keyData.subkeyId >= 0) {
      keyChain.push({
        ...keyData,
        folderId,
      });
    }
  } else {
    const workspaceKey = await deriveWorkspaceKey({
      workspaceId: workspaceId,
      workspaceKeyId: usingWorkspaceKeyId,
      activeDevice,
    });
    keyData = {
      key: workspaceKey.workspaceKey,
      subkeyId: -1,
    };
  }
  return { keyData, keyChain };
};

export type DeriveFolderKeyProps = {
  folderId: string;
  workspaceKeyId?: string;
  workspaceId: string;
  activeDevice: Device;
};
export const deriveFolderKey = async ({
  folderId,
  workspaceId,
  workspaceKeyId,
  activeDevice,
}: DeriveFolderKeyProps) => {
  let usingWorkspaceKeyId = workspaceKeyId;
  if (!usingWorkspaceKeyId) {
    const workspace = await getWorkspace({
      workspaceId,
      deviceSigningPublicKey: activeDevice.signingPublicKey,
    });
    if (!workspace?.currentWorkspaceKey?.id) {
      throw new Error("Workspace key not found");
    }
    usingWorkspaceKeyId = workspace.currentWorkspaceKey.id;
  }
  let parentKeyData = await deriveParentFolderKey({
    folderId,
    workspaceKeyId: usingWorkspaceKeyId,
    workspaceId,
    activeDevice,
  });
  const keyChain = parentKeyData.keyChain;
  const parentKey = parentKeyData.keyData;
  const folder = await getFolder({
    id: folderId,
  });
  const folderKeyData = await kdfDeriveFromKey({
    key: parentKey.key,
    context: folderDerivedKeyContext,
    subkeyId: folder.subkeyId!,
  });
  return { folderKeyData, keyChain };
};
