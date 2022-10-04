import { folderDerivedKeyContext } from "@serenity-tools/common";
import { kdfDeriveFromKey } from "@serenity-tools/common/src/kdfDeriveFromKey/kdfDeriveFromKey";
import { Client } from "urql";
import { Device } from "../../types/Device";
import { getWorkspaceKey } from "../workspace/getWorkspaceKey";
import { getFolder } from "./getFolder";

export type GetParentFolderKeyProps = {
  folderId: string;
  workspaceId: string;
  urqlClient: Client;
  activeDevice: Device;
};
export const getParentFolderKey = async ({
  folderId,
  workspaceId,
  urqlClient,
  activeDevice,
}: GetParentFolderKeyProps) => {
  let parentKey = "";
  const folder = await getFolder({
    id: folderId,
    urqlClient,
  });
  if (folder.parentFolderId) {
    const parentFolderKeyData = await getFolderKey({
      folderId: folder.parentFolderId,
      workspaceId: workspaceId,
      urqlClient,
      activeDevice,
    });
    parentKey = parentFolderKeyData.key;
  } else {
    const workspaceKey = await getWorkspaceKey({
      workspaceId: workspaceId,
      urqlClient,
      activeDevice,
    });
    parentKey = workspaceKey;
  }
  return parentKey;
};

export type GetFolderKeyProps = {
  folderId: string;
  workspaceId: string;
  urqlClient: Client;
  activeDevice: Device;
};
export const getFolderKey = async ({
  folderId,
  workspaceId,
  urqlClient,
  activeDevice,
}: GetFolderKeyProps) => {
  let parentKey = await getParentFolderKey({
    folderId,
    workspaceId,
    urqlClient,
    activeDevice,
  });
  const folder = await getFolder({
    id: folderId,
    urqlClient,
  });
  const folderKeyData = await kdfDeriveFromKey({
    key: parentKey,
    context: folderDerivedKeyContext,
    subkeyId: folder.subkeyId!,
  });
  return folderKeyData;
};
