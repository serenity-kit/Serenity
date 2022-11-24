import {
  decryptDocumentTitle,
  recreateDocumentKey,
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
          workspaceId: document.workspaceId!,
          keyDerivationTrace: document.nameKeyDerivationTrace,
          activeDevice,
        });
        // the last subkey key is treated like a folder key,
        // but actually we want to create a document subkey, so we can
        // use all subkeys up to the last one
        const lastChainItem = folderKeyChainData[folderKeyChainData.length - 2];
        const documentKeyData = await recreateDocumentKey({
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
