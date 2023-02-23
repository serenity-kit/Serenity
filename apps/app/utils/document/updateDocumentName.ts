import {
  createDocumentKey,
  deriveKeysFromKeyDerivationTrace,
  encryptDocumentTitle,
} from "@serenity-tools/common";
import {
  Document,
  runUpdateDocumentNameMutation,
} from "../../generated/graphql";
import { Device } from "../../types/Device";
import { getWorkspace } from "../workspace/getWorkspace";

export type Props = {
  document: Document;
  name: string;
  activeDevice: Device;
};
export const updateDocumentName = async ({
  document,
  name,
  activeDevice,
}: Props): Promise<Document> => {
  const workspace = await getWorkspace({
    workspaceId: document.workspaceId!,
    deviceSigningPublicKey: activeDevice.signingPublicKey,
  });
  if (!workspace?.currentWorkspaceKey) {
    throw new Error("Workspace or workspaceKeys not found");
  }
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
        id: document.id,
        encryptedName: encryptedDocumentTitle.ciphertext,
        encryptedNameNonce: encryptedDocumentTitle.publicNonce,
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
