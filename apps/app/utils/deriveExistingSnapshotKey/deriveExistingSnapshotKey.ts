import {
  deriveKeysFromKeyDerivationTrace,
  LocalDevice,
  recreateSnapshotKey,
  SerenitySnapshot,
} from "@serenity-tools/common";
import { getDocument } from "../document/getDocument";
import { getWorkspace } from "../workspace/getWorkspace";

export const deriveExistingSnapshotKey = async (
  docId: string,
  snapshot: SerenitySnapshot,
  activeDevice: LocalDevice
) => {
  const snapshotKeyDerivationTrace = snapshot.publicData.keyDerivationTrace;
  // derive existing key if snapshot exists
  const document = await getDocument({ documentId: docId });
  const workspace = await getWorkspace({
    workspaceId: document.workspaceId!,
    deviceSigningPublicKey: activeDevice.signingPublicKey,
  });
  if (
    !workspace ||
    !workspace.workspaceKeys ||
    workspace.workspaceKeys.length === 0
  ) {
    throw new Error("No workspace keys found");
  }
  const workspaceKey = workspace.workspaceKeys.find((workspaceKey) => {
    return workspaceKey.id === snapshotKeyDerivationTrace.workspaceKeyId;
  });
  if (!workspaceKey || !workspaceKey.workspaceKeyBox) {
    throw new Error("No workspace key box found for this device");
  }
  const folderKeyChainData = deriveKeysFromKeyDerivationTrace({
    keyDerivationTrace: snapshotKeyDerivationTrace,
    activeDevice: {
      signingPublicKey: activeDevice.signingPublicKey,
      signingPrivateKey: activeDevice.signingPrivateKey!,
      encryptionPublicKey: activeDevice.encryptionPublicKey,
      encryptionPrivateKey: activeDevice.encryptionPrivateKey!,
      encryptionPublicKeySignature: activeDevice.encryptionPublicKeySignature!,
    },
    workspaceKeyBox: workspaceKey.workspaceKeyBox,
  });
  const folderChainItem =
    folderKeyChainData.trace[folderKeyChainData.trace.length - 2];
  const snapshotChainItem =
    folderKeyChainData.trace[folderKeyChainData.trace.length - 1];
  const snapshotKeyData = recreateSnapshotKey({
    folderKey: folderChainItem.key,
    subkeyId: snapshotChainItem.subkeyId,
  });
  return snapshotKeyData;
};
