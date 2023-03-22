import {
  createSnapshotKey,
  deriveKeysFromKeyDerivationTrace,
  snapshotDerivedKeyContext,
} from "@serenity-tools/common";
import { Document } from "../../generated/graphql";
import { Device } from "../../types/Device";
import { createFolderKeyDerivationTrace } from "../folder/createFolderKeyDerivationTrace";
import { getFolder } from "../folder/getFolder";
import { getWorkspace } from "../workspace/getWorkspace";

type Params = {
  document: Document;
  snapshotId: string;
  activeDevice: Device;
};

export const createNewSnapshotKey = async ({
  document,
  snapshotId,
  activeDevice,
}: Params) => {
  const workspace = await getWorkspace({
    workspaceId: document.workspaceId!,
    deviceSigningPublicKey: activeDevice.signingPublicKey,
  });
  if (!workspace?.currentWorkspaceKey) {
    throw new Error("No workspace key for workspace and device");
  }
  const folder = await getFolder({ id: document.parentFolderId! });
  const keyDerivationTrace = await createFolderKeyDerivationTrace({
    workspaceKeyId: workspace?.currentWorkspaceKey?.id!,
    folderId: document.parentFolderId,
  });
  const folderKeyChainData = deriveKeysFromKeyDerivationTrace({
    keyDerivationTrace: folder.keyDerivationTrace,
    activeDevice: {
      signingPublicKey: activeDevice.signingPublicKey,
      signingPrivateKey: activeDevice.signingPrivateKey!,
      encryptionPublicKey: activeDevice.encryptionPublicKey,
      encryptionPrivateKey: activeDevice.encryptionPrivateKey!,
      encryptionPublicKeySignature: activeDevice.encryptionPublicKeySignature!,
    },
    // @ts-expect-error
    workspaceKeyBox: workspace.currentWorkspaceKey.workspaceKeyBox!,
  });

  const parentFolderChainItem =
    folderKeyChainData.trace[folderKeyChainData.trace.length - 1];

  const snapshotKeyData = createSnapshotKey({
    folderKey: parentFolderChainItem.key,
  });

  keyDerivationTrace.trace.push({
    entryId: snapshotId,
    subkeyId: snapshotKeyData.subkeyId,
    parentId: parentFolderChainItem.entryId,
    context: snapshotDerivedKeyContext,
  });

  return {
    key: snapshotKeyData.key,
    subkeyId: snapshotKeyData.subkeyId,
    keyDerivationTrace,
  };
};
