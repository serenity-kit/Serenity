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
  let parentKey = "";
  const folder = await getFolder({
    id: folderId,
  });
  if (folder.parentFolderId) {
    const parentFolderKeyData = await getFolderKey({
      folderId: folder.parentFolderId,
      workspaceId: workspaceId,
      activeDevice,
    });
    parentKey = parentFolderKeyData.key;
  } else {
    const workspaceKey = await getWorkspaceKey({
      workspaceId: workspaceId,
      activeDevice,
    });
    parentKey = workspaceKey.workspaceKey;
  }
  return parentKey;
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
  let parentKey = await getParentFolderKey({
    folderId,
    workspaceId,
    activeDevice,
  });
  const folder = await getFolder({
    id: folderId,
  });
  const folderKeyData = await kdfDeriveFromKey({
    key: parentKey,
    context: folderDerivedKeyContext,
    subkeyId: folder.subkeyId!,
  });
  return folderKeyData;
};
