import { Client } from "urql";
import { Device } from "../../types/Device";
import { getWorkspaceKey } from "../workspace/getWorkspaceKey";
import { getFolder } from "./getFolder";
import { getFolderKey } from "./getFolderKey";

export type Props = {
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
}: Props) => {
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
