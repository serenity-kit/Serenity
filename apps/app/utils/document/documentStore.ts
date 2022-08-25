import {
  decryptDocumentTitle,
  recreateDocumentKey,
} from "@serenity-tools/common";
import { Client } from "urql";
import create from "zustand";
import { Document } from "../../generated/graphql";
import { getFolderKey } from "../folder/getFolderKey";

interface DocumentState {
  document: Document | null | undefined;
  documentName: string | null;
  update: (document: Document | null | undefined, urqlClient: Client) => void;
}

export const useDocumentStore = create<DocumentState>((set) => ({
  document: null,
  documentName: null,
  update: async (document, urqlClient) => {
    let documentName: string | null = "Could not decrypt";
    if (
      document &&
      document.encryptedName &&
      document.encryptedNameNonce &&
      document.subkeyId
    ) {
      const folderKeyData = await getFolderKey({
        folderId: document?.parentFolderId!,
        workspaceId: document?.workspaceId!,
        urqlClient,
      });
      const documentKeyData = await recreateDocumentKey({
        folderKey: folderKeyData.key,
        subkeyId: document?.subkeyId!,
      });
      documentName = await decryptDocumentTitle({
        key: documentKeyData.key,
        ciphertext: document?.encryptedName!,
        publicNonce: document?.encryptedNameNonce!,
      });
    }
    set((state) => ({
      document,
      documentName,
    }));
  },
}));
