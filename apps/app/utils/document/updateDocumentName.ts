import { encryptDocumentTitle, LocalDevice } from "@serenity-tools/common";
import {
  Document,
  runSnapshotQuery,
  runUpdateDocumentNameMutation,
} from "../../generated/graphql";
import { loadRemoteWorkspaceMemberDevicesProofQuery } from "../../store/workspaceMemberDevicesProofStore";
import { getWorkspace } from "../workspace/getWorkspace";

export type Props = {
  documentId: string;
  workspaceId: string;
  name: string;
  activeDevice: LocalDevice;
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

  const workspaceMemberDevicesProof =
    await loadRemoteWorkspaceMemberDevicesProofQuery({
      workspaceId,
    });

  const encryptedDocumentTitle = encryptDocumentTitle({
    title: name,
    activeDevice,
    workspaceKeyBox: workspace.currentWorkspaceKey.workspaceKeyBox!,
    snapshot: snapshotResult.data.snapshot,
    workspaceId,
    workspaceKeyId: workspace.currentWorkspaceKey.id,
    documentId,
    workspaceMemberDevicesProof: workspaceMemberDevicesProof.proof,
  });
  const updateDocumentNameResult = await runUpdateDocumentNameMutation(
    {
      input: {
        id: documentId,
        nameCiphertext: encryptedDocumentTitle.ciphertext,
        nameNonce: encryptedDocumentTitle.nonce,
        workspaceKeyId: workspace?.currentWorkspaceKey?.id!,
        subkeyId: encryptedDocumentTitle.subkeyId,
        nameSignature: encryptedDocumentTitle.signature,
        nameWorkspaceMemberDevicesProofHash:
          workspaceMemberDevicesProof.proof.hash,
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
