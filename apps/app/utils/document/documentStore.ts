import {
  decryptDocumentTitle,
  recreateDocumentKey,
} from "@serenity-tools/common";
import create from "zustand";
import { Document } from "../../generated/graphql";

interface DocumentState {
  document: Document | null | undefined;
  documentName: string | null;
  update: (document: Document | null | undefined, folderKey: string) => void;
}

export const useDocumentStore = create<DocumentState>((set) => ({
  document: null,
  documentName: null,
  update: async (document, folderKey) => {
    const documentKeyData = await recreateDocumentKey({
      folderKey: folderKey,
      subkeyId: document?.subkeyId!,
    });
    const documentName = await decryptDocumentTitle({
      key: documentKeyData.key,
      ciphertext: document?.encryptedName!,
      publicNonce: document?.encryptedNameNonce!,
    });
    set((state) => ({
      document,
      documentName,
    }));
  },
}));
