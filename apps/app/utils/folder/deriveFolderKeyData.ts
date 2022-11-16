import { KeyDerivationTrace } from "@naisho/core";
import { folderDerivedKeyContext } from "@serenity-tools/common";
import { kdfDeriveFromKey } from "@serenity-tools/common/src/kdfDeriveFromKey/kdfDeriveFromKey";
import { Device } from "../../types/Device";
import { deriveWorkspaceKey } from "../workspace/deriveWorkspaceKey";
import { getFolder } from "./getFolder";

export type FolderKeyDerivationChainItem = {
  folderId: string | undefined; // the folderId, undefined if workspaceKey
  key: string; // symmetric key
  subkeyId: number | undefined; // subkey used to derive this key, undefined if workspaceId
};
export type DeriveParentFolderKeyProps = {
  folderId: string;
  overrideWithWorkspaceKeyId?: string | null | undefined;
  keyDerivationTrace: KeyDerivationTrace;
  activeDevice: Device;
};
export const deriveFolderKey = async ({
  folderId,
  overrideWithWorkspaceKeyId,
  keyDerivationTrace,
  activeDevice,
}: DeriveParentFolderKeyProps): Promise<FolderKeyDerivationChainItem[]> => {
  // get the folder
  const folder = await getFolder({ id: folderId });
  // check if we are using a specific workspace key id
  const workspaceKeyId =
    overrideWithWorkspaceKeyId || keyDerivationTrace.workspaceKeyId;
  // if there is no parentFolderId, we are at the root of the folder tree
  // just derive the workpsace key as the parent key
  let parentFolderKeyData: FolderKeyDerivationChainItem[] = [];
  if (!folder.parentFolderId) {
    const workspaceKey = await deriveWorkspaceKey({
      workspaceId: folder.workspaceId!,
      workspaceKeyId,
      activeDevice,
    });
    parentFolderKeyData = [
      {
        key: workspaceKey.workspaceKey,
        subkeyId: undefined,
        folderId: workspaceKeyId, // TODO: remove this. it's not needed
      },
    ];
  } else {
    // if there is a parent folder, we must derive that first
    // to get the parent key
    parentFolderKeyData = await deriveFolderKey({
      folderId: folder.parentFolderId!,
      overrideWithWorkspaceKeyId: workspaceKeyId,
      keyDerivationTrace: folder.keyDerivationTrace,
      activeDevice,
    });
  }
  // now we can derive the current folder key
  const lastItem = parentFolderKeyData[parentFolderKeyData.length - 1];
  const folderKeyData = await kdfDeriveFromKey({
    key: lastItem.key,
    context: folderDerivedKeyContext,
    subkeyId: folder.keyDerivationTrace.subkeyId,
  });
  const folderKeyChain: FolderKeyDerivationChainItem[] = [
    ...parentFolderKeyData,
    {
      key: folderKeyData.key,
      subkeyId: folder.keyDerivationTrace.subkeyId,
      folderId: folder.id,
    },
  ];
  return folderKeyChain;
};
