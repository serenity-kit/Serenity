import { KeyDerivationTrace } from "@naisho/core";
import { folderDerivedKeyContext } from "@serenity-tools/common";
import { kdfDeriveFromKey } from "@serenity-tools/common/src/kdfDeriveFromKey/kdfDeriveFromKey";
import { Device } from "../../types/Device";
import { deriveWorkspaceKey } from "../workspace/deriveWorkspaceKey";

export type FolderKeyDerivationChainItem = {
  folderId: string | undefined; // the folderId, undefined if workspaceKey
  key: string; // symmetric key
  subkeyId: number | undefined; // subkey used to derive this key, undefined if workspaceId
};
export type Props = {
  workspaceId: string;
  folderId: string;
  keyDerivationTrace: KeyDerivationTrace;
  overrideWithWorkspaceKeyId?: string | null | undefined;
  activeDevice: Device;
};
export const deriveFolderKey = async ({
  workspaceId,
  folderId,
  keyDerivationTrace,
  overrideWithWorkspaceKeyId,
  activeDevice,
}: Props) => {
  const workspaceKeyId =
    overrideWithWorkspaceKeyId || keyDerivationTrace.workspaceKeyId;
  // using a KeyDerivationTrace object, loop through parent folders
  // until empty, then return the workspace key from the workspaceKeyId.
  // append each key derivation from the loop.
  // then derive the folder key from the subeyId.
  const workspaceKey = await deriveWorkspaceKey({
    workspaceId,
    workspaceKeyId,
    activeDevice,
  });
  const folderKeyDerivationTrace: FolderKeyDerivationChainItem[] = [
    {
      key: workspaceKey.workspaceKey,
      subkeyId: undefined,
      folderId: `workspaceKeyId-${workspaceKeyId}`,
    },
  ];
  // NOTE: assume for now that the parent folder key data are in reverse order
  let parentKey = workspaceKey.workspaceKey;
  for (let i = keyDerivationTrace.parentFolders.length - 1; i >= 0; i--) {
    const ancestorKeySeedData = keyDerivationTrace.parentFolders[i];
    const ancestorKeyData = kdfDeriveFromKey({
      key: parentKey,
      context: folderDerivedKeyContext,
      subkeyId: ancestorKeySeedData.subkeyId,
    });
    parentKey = ancestorKeyData.key;
    folderKeyDerivationTrace.push({
      key: ancestorKeyData.key,
      subkeyId: ancestorKeySeedData.subkeyId,
      folderId: ancestorKeySeedData.folderId,
    });
  }
  // special case: append the current folder key
  const folderKeyData = kdfDeriveFromKey({
    key: parentKey,
    context: folderDerivedKeyContext,
    subkeyId: keyDerivationTrace.subkeyId,
  });
  folderKeyDerivationTrace.push({
    key: folderKeyData.key,
    subkeyId: keyDerivationTrace.subkeyId,
    folderId,
  });
  return folderKeyDerivationTrace;
};
