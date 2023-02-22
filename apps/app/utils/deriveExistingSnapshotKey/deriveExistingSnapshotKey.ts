import { Snapshot } from "@naisho/core";
import { LocalDevice, recreateSnapshotKey } from "@serenity-tools/common";
import { getDocument } from "../document/getDocument";
import { deriveFolderKey } from "../folder/deriveFolderKeyData";

export const deriveExistingSnapshotKey = async (
  docId: string,
  snapshot: Snapshot,
  activeDevice: LocalDevice
) => {
  // derive existing key if snapshot exists
  const document = await getDocument({ documentId: docId });
  console.log({ snapshot });
  const snapshotKeyDerivationTrace = snapshot.publicData.keyDerivationTrace;
  const folderKeyChainData = await deriveFolderKey({
    folderId: document.parentFolderId!,
    workspaceId: document.workspaceId!,
    keyDerivationTrace: snapshotKeyDerivationTrace,
    activeDevice,
  });
  console.log({ snapshotKeyDerivationTrace });
  console.log({ folderKeyChainData });
  // the last subkey key here is treated like a folder key
  // but since we want to derive a snapshot key, we can just toss
  // the last one out and use the rest
  const lastChainItem = folderKeyChainData[folderKeyChainData.length - 2];
  const snapshotKeyData = recreateSnapshotKey({
    folderKey: lastChainItem.key,
    subkeyId: snapshotKeyDerivationTrace.subkeyId,
  });
  return snapshotKeyData;
};
