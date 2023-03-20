import create from "zustand";
import { Document } from "../../generated/graphql";
import { Device } from "../../types/Device";

interface DocumentState {
  document: Document | null | undefined;
  documentName: string | null;
  update: (
    document: Document | null | undefined,
    activeDevice: Device
  ) => Promise<void>;
}

export const useActiveDocumentInfoStore = create<DocumentState>((set) => ({
  document: null,
  documentName: null,
  update: async (document, activeDevice) => {
    let documentName: string | null = "Untitled";
    // if (
    //   document &&
    //   document.nameCiphertext &&
    //   document.nameNonce &&
    //   document.subkeyId
    // ) {
    //   const workspace = await getWorkspace({
    //     workspaceId: document.workspaceId!,
    //     deviceSigningPublicKey: activeDevice.signingPublicKey,
    //   });
    //   // TODO: include documentShareLink in the query
    //   const snapshotResult = await runSnapshotQuery({
    //     documentId: document.id!,
    //   });
    //   if (!snapshotResult.data?.snapshot) {
    //     throw new Error(
    //       snapshotResult.error?.message || "Could not find snapshot"
    //     );
    //   }
    //   const snapshot = snapshotResult.data.snapshot;
    //   try {
    //     const snapshotFolderKeyData = deriveKeysFromKeyDerivationTrace({
    //       keyDerivationTrace: snapshot.keyDerivationTrace,
    //       activeDevice: {
    //         signingPublicKey: activeDevice.signingPublicKey,
    //         signingPrivateKey: activeDevice.signingPrivateKey!,
    //         encryptionPublicKey: activeDevice.encryptionPublicKey,
    //         encryptionPrivateKey: activeDevice.encryptionPrivateKey!,
    //         encryptionPublicKeySignature:
    //           activeDevice.encryptionPublicKeySignature!,
    //       },
    //       workspaceKeyBox: workspace!.currentWorkspaceKey!.workspaceKeyBox!,
    //     });
    //     const snapshotKeyData =
    //       snapshotFolderKeyData.trace[snapshotFolderKeyData.trace.length - 1];
    //     const documentKeyData = recreateDocumentKey({
    //       snapshotKey: snapshotKeyData.key,
    //       subkeyId: document.subkeyId!,
    //     });
    //     documentName = decryptDocumentTitle({
    //       key: documentKeyData.key,
    //       ciphertext: document.nameCiphertext,
    //       publicNonce: document.nameNonce,
    //     });
    //   } catch (error) {
    //     documentName = "Could not decrypt";
    //     console.error(error);
    //   }
    // }
    set(() => ({
      document,
      documentName,
    }));
  },
}));
