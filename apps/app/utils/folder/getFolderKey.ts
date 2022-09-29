import { folderDerivedKeyContext } from "@serenity-tools/common";
import { kdfDeriveFromKey } from "@serenity-tools/common/src/kdfDeriveFromKey/kdfDeriveFromKey";
import { Client } from "urql";
import { Device } from "../../types/Device";
import { getWorkspaceKey } from "../workspace/getWorkspaceKey";
import { getFolder } from "./getFolder";

export type Props = {
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
}: Props) => {
  let parentKey = "";
  const folder = await getFolder({
    id: folderId,
    urqlClient,
  });
  if (folder.parentFolderId) {
    const parentFolderKeyData = await getFolderKey({
      folderId: folder.parentFolderId,
      workspaceId,
      urqlClient,
      activeDevice,
    });
    parentKey = parentFolderKeyData.key;
  } else {
    parentKey = await getWorkspaceKey({
      workspaceId,
      urqlClient,
      activeDevice,
    });
  }
  const folderKeyData = await kdfDeriveFromKey({
    key: parentKey,
    context: folderDerivedKeyContext,
    subkeyId: folder.subkeyId!,
  });
  return folderKeyData;
};
