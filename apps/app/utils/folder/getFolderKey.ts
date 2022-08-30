import { folderDerivedKeyContext } from "@serenity-tools/common";
import { kdfDeriveFromKey } from "@serenity-tools/common/src/kdfDeriveFromKey/kdfDeriveFromKey";
import { Client } from "urql";
import { getDevices } from "../device/getDevices";
import { getWorkspaceKey } from "../workspace/getWorkspaceKey";
import { getFolder } from "./getFolder";

export type Props = {
  folderId: string;
  workspaceId: string;
  urqlClient: Client;
};
export const getFolderKey = async ({
  folderId,
  workspaceId,
  urqlClient,
}: Props) => {
  const devices = await getDevices({ urqlClient });
  if (!devices) {
    throw new Error("No devices found");
  }
  const workspaceKey = await getWorkspaceKey({
    workspaceId: workspaceId!,
    devices,
    urqlClient,
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
