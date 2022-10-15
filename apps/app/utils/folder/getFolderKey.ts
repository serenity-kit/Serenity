import { folderDerivedKeyContext } from "@serenity-tools/common";
import { kdfDeriveFromKey } from "@serenity-tools/common/src/kdfDeriveFromKey/kdfDeriveFromKey";
import { Device } from "../../types/Device";
import { getWorkspaceKey } from "../workspace/getWorkspaceKey";
import { getFolder } from "./getFolder";

export type GetParentFolderKeyProps = {
  folderId: string;
  workspaceId: string;
  activeDevice: Device;
};
export const getParentFolderKey = async ({
  folderId,
  workspaceId,
  activeDevice,
}: GetParentFolderKeyProps) => {
  let keyData = {
    key: "",
    subkeyId: -1,
  };
  const folder = await getFolder({
    id: folderId,
  });
  let keyChain: any[] = [];
  if (folder.parentFolderId) {
    const parentFolderKeyData = await getFolderKey({
      folderId: folder.parentFolderId,
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
    const workspaceKey = await getWorkspaceKey({
      workspaceId: workspaceId,
      activeDevice,
    });
    keyData = {
      key: workspaceKey.workspaceKey,
      subkeyId: -1,
    };
  }
  return { keyData, keyChain };
};

export type GetFolderKeyProps = {
  folderId: string;
  workspaceId: string;
  activeDevice: Device;
};
export const getFolderKey = async ({
  folderId,
  workspaceId,
  activeDevice,
}: GetFolderKeyProps) => {
  let parentKeyData = await getParentFolderKey({
    folderId,
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
