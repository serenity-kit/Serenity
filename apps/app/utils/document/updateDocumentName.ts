import {
  createSnapshotKey,
  encryptDocumentTitle,
} from "@serenity-tools/common";
import {
  Document,
  runUpdateDocumentNameMutation,
} from "../../generated/graphql";
import { Device } from "../../types/Device";
import { buildKeyDerivationTrace } from "../folder/buildKeyDerivationTrace";
import { deriveFolderKey } from "../folder/deriveFolderKeyData";
import { getFolder } from "../folder/getFolder";
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
  const folder = await getFolder({ id: document.parentFolderId! });
  const folderKeyData = await deriveFolderKey({
    folderId: document.parentFolderId!,
    keyDerivationTrace: folder.keyDerivationTrace,
    overrideWithWorkspaceKeyId: workspace.currentWorkspaceKey.id,
    activeDevice,
  });
  const lastKeyTraceItem = folderKeyData[folderKeyData.length - 1];
  // FIXME: since as a hack we are expecting to use the snapshotkey
  // to derive the document title, we must use that here
  // const documentKeyData = await createDocumentKey({
  //   folderKey: lastKeyTraceItem.key,
  // });
  const documentKeyData = await createSnapshotKey({
    folderKey: lastKeyTraceItem.key,
  });
  const documentKey = documentKeyData.key;
  const encryptedDocumentTitle = await encryptDocumentTitle({
    title: name,
    key: documentKey,
  });
  const nameKeyDerivationTrace = await buildKeyDerivationTrace({
    folderId: document.parentFolderId!,
    subkeyId: documentKeyData.subkeyId,
    workspaceKeyId: workspace.currentWorkspaceKey.id,
  });
  const updateDocumentNameResult = await runUpdateDocumentNameMutation(
    {
      input: {
        id: document.id,
        encryptedName: encryptedDocumentTitle.ciphertext,
        encryptedNameNonce: encryptedDocumentTitle.publicNonce,
        workspaceKeyId: workspace?.currentWorkspaceKey?.id!,
        subkeyId: documentKeyData.subkeyId,
        nameKeyDerivationTrace,
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