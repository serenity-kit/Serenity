import {
  createDocumentKey,
  deriveKeysFromKeyDerivationTrace,
  encryptDocumentTitle,
} from "@serenity-tools/common";
import {
  Document,
  runSnapshotQuery,
  runUpdateDocumentNameMutation,
} from "../../generated/graphql";
import { Device } from "../../types/Device";
import { getWorkspace } from "../workspace/getWorkspace";

export type Props = {
  documentId: string;
  workspaceId: string;
  name: string;
  activeDevice: Device;
};
export const updateDocumentName = async ({
  documentId,
  workspaceId,
  name,
  activeDevice,
}: Props): Promise<Document> => {
  const workspace = await getWorkspace({
    workspaceId,
    deviceSigningPublicKey: activeDevice.signingPublicKey,
  });
  if (!workspace?.currentWorkspaceKey) {
    throw new Error("Workspace or workspaceKeys not found");
  }
  const snapshotResult = await runSnapshotQuery({
    documentId: documentId,
  });
  if (!snapshotResult.data?.snapshot) {
    throw new Error(snapshotResult.error?.message || "Could not get snapshot");
  }
  const snapshot = snapshotResult.data.snapshot;
  const snapshotFolderKeyData = deriveKeysFromKeyDerivationTrace({
    keyDerivationTrace: snapshot.keyDerivationTrace,
    activeDevice: {
      signingPublicKey: activeDevice.signingPublicKey,
      signingPrivateKey: activeDevice.signingPrivateKey!,
      encryptionPublicKey: activeDevice.encryptionPublicKey,
      encryptionPrivateKey: activeDevice.encryptionPrivateKey!,
      encryptionPublicKeySignature: activeDevice.encryptionPublicKeySignature!,
    },
    workspaceKeyBox: workspace.currentWorkspaceKey.workspaceKeyBox!,
  });
  const snapshotKeyData =
    snapshotFolderKeyData.trace[snapshotFolderKeyData.trace.length - 1];
  const documentKeyData = createDocumentKey({
    snapshotKey: snapshotKeyData.key,
  });
  const documentKey = documentKeyData.key;
  const encryptedDocumentTitle = encryptDocumentTitle({
    title: name,
    key: documentKey,
  });
  const updateDocumentNameResult = await runUpdateDocumentNameMutation(
    {
      input: {
        id: documentId,
        nameCiphertext: encryptedDocumentTitle.ciphertext,
        nameNonce: encryptedDocumentTitle.publicNonce,
        workspaceKeyId: workspace?.currentWorkspaceKey?.id!,
        subkeyId: documentKeyData.subkeyId,
      },
    },
    {}
  );
  if (!updateDocumentNameResult.data?.updateDocumentName?.document) {
    throw new Error(
      updateDocumentNameResult.error?.message ||
        "Could not update document name"
    );
  }
  const updatedDocument =
    updateDocumentNameResult.data.updateDocumentName.document;
  return updatedDocument;
};
