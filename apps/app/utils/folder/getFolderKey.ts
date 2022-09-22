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
  const workspaceKey = await getWorkspaceKey({
    workspaceId: workspaceId!,
    urqlClient,
    activeDevice,
  });
  const folder = await getFolder({
    id: folderId,
    urqlClient,
  });
  const folderKeyData = await kdfDeriveFromKey({
    key: workspaceKey,
    context: folderDerivedKeyContext,
    subkeyId: folder.subkeyId!,
  });
  return folderKeyData;
};
