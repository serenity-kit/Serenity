import {
  decryptDocumentTitle,
  folderDerivedKeyContext,
  recreateDocumentKey,
} from "@serenity-tools/common";
import { kdfDeriveFromKey } from "@serenity-tools/common/src/kdfDeriveFromKey/kdfDeriveFromKey";
import { Client } from "urql";
import create from "zustand";
import { Document } from "../../generated/graphql";
import { getDevices } from "../device/getDevices";
import { getFolder } from "../folder/getFolder";
import { getWorkspaceKey } from "../workspace/getWorkspaceKey";

interface DocumentState {
  document: Document | null | undefined;
  documentName: string | null;
  update: (document: Document | null | undefined, urqlClient: Client) => void;
}

export const useDocumentStore = create<DocumentState>((set) => ({
  document: null,
  documentName: null,
  update: async (document, urqlClient) => {
    let documentName: string | null = null;
    if (
      document &&
      document.encryptedName &&
      document.encryptedNameNonce &&
      document.subkeyId
    ) {
      const devices = await getDevices({ urqlClient });
      if (!devices) {
        console.error("No devices found");
        return;
      }
      const workspaceKey = await getWorkspaceKey({
        workspaceId: document?.workspaceId!,
        devices,
        urqlClient,
      });
      const folder = await getFolder({
        id: document?.parentFolderId!,
        urqlClient,
      });
      const folderKeyData = await kdfDeriveFromKey({
        key: workspaceKey,
        context: folderDerivedKeyContext,
        subkeyId: folder.subKeyId!,
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
