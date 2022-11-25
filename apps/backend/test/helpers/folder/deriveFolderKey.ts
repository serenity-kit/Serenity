import { KeyDerivationTrace } from "@naisho/core";
import { folderDerivedKeyContext, LocalDevice } from "@serenity-tools/common";
import { kdfDeriveFromKey } from "@serenity-tools/common/src/kdfDeriveFromKey/kdfDeriveFromKey";
import { prisma } from "../../../src/database/prisma";
import { decryptWorkspaceKey } from "../device/decryptWorkspaceKey";

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
  activeDevice: LocalDevice;
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
  const workspaceKeyBox = await prisma.workspaceKeyBox.findFirst({
    where: {
      workspaceKeyId,
      workspaceKey: { workspaceId },
      deviceSigningPublicKey: activeDevice.signingPublicKey,
    },
    include: {
      creatorDevice: true,
    },
  });
  if (!workspaceKeyBox) {
    throw new Error("Workspace key not found");
  }
  const workspaceKeyString = await decryptWorkspaceKey({
    ciphertext: workspaceKeyBox.ciphertext,
    nonce: workspaceKeyBox.nonce,
    creatorDeviceEncryptionPublicKey:
      workspaceKeyBox.creatorDevice.encryptionPublicKey,
    receiverDeviceEncryptionPrivateKey: activeDevice.encryptionPrivateKey,
  });
  const folderKeyDerivationTrace: FolderKeyDerivationChainItem[] = [
    {
      key: workspaceKeyString,
      subkeyId: undefined,
      folderId: `workspaceKeyId-${workspaceKeyId}`,
    },
  ];
  // NOTE: assume for now that the parent folder key data are in reverse order
  let parentKey = workspaceKeyString;
  for (let i = keyDerivationTrace.parentFolders.length - 1; i >= 0; i--) {
    const ancestorKeySeedData = keyDerivationTrace.parentFolders[i];
    const ancestorKeyData = await kdfDeriveFromKey({
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
  const folderKeyData = await kdfDeriveFromKey({
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
