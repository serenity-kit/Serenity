import {
  decryptDocumentTitle,
  recreateDocumentKey,
} from "@serenity-tools/common";
import { Client } from "urql";
import create from "zustand";
import { Document } from "../../generated/graphql";
import { Device } from "../../types/Device";
import { getFolderKey } from "../folder/getFolderKey";

interface DocumentState {
  document: Document | null | undefined;
  documentName: string | null;
  update: (
    document: Document | null | undefined,
    urqlClient: Client,
    activeDevice: Device
  ) => Promise<void>;
}

export const useDocumentStore = create<DocumentState>((set) => ({
  document: null,
  documentName: null,
  update: async (document, urqlClient, activeDevice) => {
    let documentName: string | null = "Untitled";
    if (
      document &&
      document.encryptedName &&
      document.encryptedNameNonce &&
      document.subkeyId
    ) {
      try {
        const folderKeyData = await getFolderKey({
          folderId: document?.parentFolderId!,
          workspaceId: document?.workspaceId!,
          urqlClient,
          activeDevice,
        });
        const documentKeyData = await recreateDocumentKey({
          folderKey: folderKeyData.key,
          subkeyId: document?.subkeyId!,
        });
        documentName = await decryptDocumentTitle({
          key: documentKeyData.key,
          ciphertext: document?.encryptedName,
          publicNonce: document?.encryptedNameNonce,
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
