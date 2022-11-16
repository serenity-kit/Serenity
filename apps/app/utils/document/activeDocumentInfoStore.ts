import {
  decryptDocumentTitle,
  recreateSnapshotKey,
} from "@serenity-tools/common";
import create from "zustand";
import { Document } from "../../generated/graphql";
import { Device } from "../../types/Device";
import { deriveFolderKey } from "../folder/deriveFolderKeyData";

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
    if (
      document &&
      document.encryptedName &&
      document.encryptedNameNonce &&
      document.nameKeyDerivationTrace.subkeyId >= 0
    ) {
      try {
        const folderKeyChainData = await deriveFolderKey({
          folderId: document.parentFolderId!,
          // workspaceKeyId,
          // workspaceId: document.workspaceId!,
          keyDerivationTrace: document.nameKeyDerivationTrace,
          activeDevice,
        });
        const lastChainItem = folderKeyChainData[folderKeyChainData.length - 1];
        // FIXME: as a hack we are using the snapshotkey to
        // create the document title, so we must use the snapshotkey
        // also to decrypt it.
        // const documentKeyData = await recreateDocumentKey({
        //   folderKey: lastChainItem.key,
        //   subkeyId: document.nameKeyDerivationTrace.subkeyId,
        // });
        const documentKeyData = await recreateSnapshotKey({
          folderKey: lastChainItem.key,
          subkeyId: document.nameKeyDerivationTrace.subkeyId,
        });
        documentName = await decryptDocumentTitle({
          key: documentKeyData.key,
          ciphertext: document.encryptedName,
          publicNonce: document.encryptedNameNonce,
        });
      } catch (error) {
        documentName = "Could not decrypt";
        console.error(error);
      }
    }
    set(() => ({
      document,
      documentName,
    }));
  },
}));
