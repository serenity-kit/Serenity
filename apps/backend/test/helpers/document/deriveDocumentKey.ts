import { KeyDerivationTrace } from "@naisho/core";
import { LocalDevice, recreateDocumentKey } from "@serenity-tools/common";
import { deriveFolderKey } from "../folder/deriveFolderKey";

export type FolderKeyDerivationChainItem = {
  folderId: string | undefined; // the folderId, undefined if workspaceKey
  key: string; // symmetric key
  subkeyId: number | undefined; // subkey used to derive this key, undefined if workspaceId
};
export type Props = {
  workspaceId: string;
  documentSubkeyId: number;
  parentFolderId: string;
  keyDerivationTrace: KeyDerivationTrace;
  overrideWithWorkspaceKeyId?: string | null | undefined;
  activeDevice: LocalDevice;
};
export const deriveDocumentKey = async ({
  workspaceId,
  documentSubkeyId,
  parentFolderId,
  keyDerivationTrace,
  overrideWithWorkspaceKeyId,
  activeDevice,
}: Props) => {
  const parentFolderKeyDerivationTrace = await deriveFolderKey({
    folderId: parentFolderId,
    workspaceId: workspaceId,
    keyDerivationTrace,
    overrideWithWorkspaceKeyId,
    activeDevice,
  });
  const documentKey = recreateDocumentKey({
    folderKey: parentFolderKeyDerivationTrace[0].key,
    subkeyId: documentSubkeyId,
  });
  return {
    documentKey,
    parentFolderKeyDerivationTrace,
  };
};
