import { folderDerivedKeyContext } from "@serenity-tools/common";
import { kdfDeriveFromKey } from "@serenity-tools/common/src/kdfDeriveFromKey/kdfDeriveFromKey";
import { Client } from "urql";
import { Device } from "../../types/Device";
import { getFolder } from "./getFolder";
import { getParentFolderKey } from "./getParentFolderKey";

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
