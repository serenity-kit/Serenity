import { decryptFolder } from "@serenity-tools/common";
import { Client } from "urql";
import create from "zustand";
import {
  DocumentPathDocument,
  DocumentPathQuery,
  DocumentPathQueryVariables,
  Folder,
} from "../../generated/graphql";
import { b64emoji } from "../b64emojis";
import { getDevices } from "../device/getDevices";
import { getWorkspaceKey } from "../workspace/getWorkspaceKey";

interface DocumentPathState {
  folders: Folder[];
  folderIds: string[];
  folderNames: { [id: string]: string };
  getName: (folderId: string) => string;
  update: (folders: Folder[], urqlClient: Client) => void;
}

export const useDocumentPathStore = create<DocumentPathState>((set, get) => ({
  folders: [],
  folderIds: [],
  folderNames: {},
  getName: (folderId) => {
    const folderNames = get().folderNames;
    if (folderId in folderNames) {
      return folderNames[folderId];
    } else {
      return "Error retrieving name";
    }
  },
  update: async (folders, urqlClient) => {
    console.log("documentPathStore.update()");
    const devices = await getDevices({ urqlClient });
    if (!devices) {
      throw new Error("No devices found!");
    }
    // all documentPath folders should be in the same workspace
    const firstFolder = folders[0];
    const workspaceKey = await getWorkspaceKey({
      workspaceId: firstFolder.workspaceId!,
      devices,
      urqlClient,
    });
    const folderIds: string[] = [];
    const folderNames: { [id: string]: string } = {};
    for (let folder of folders) {
      folderIds.push(folder.id);
      let folderName = "Decrypting...";
      console.log({
        action: "decrypting folder path",
        folderId: folder.id,
        ciphertext: b64emoji(folder.encryptedName!),
        nonce: b64emoji(folder.encryptedNameNonce!),
        subkeyId: folder.subkeyId,
        workspaceKey: b64emoji(workspaceKey),
      });
      try {
        folderName = await decryptFolder({
          parentKey: workspaceKey,
          subkeyId: folder.subkeyId!,
          ciphertext: folder.encryptedName!,
          publicNonce: folder.encryptedNameNonce!,
        });
      } catch (error) {
        console.error(error);
        folderName = "Decryption error";
      }
      folderNames[folder.id] = folderName;
    }
    console.log("end documentPathStore.update()");
    set((state) => ({
      folders,
      folderIds,
      folderNames,
    }));
  },
}));

export const getDocumentPath = async (
  urqlClient: Client,
  documentId: string
): Promise<Folder[]> => {
  const documentPathResult = await urqlClient
    .query<DocumentPathQuery, DocumentPathQueryVariables>(
      DocumentPathDocument,
      { id: documentId },
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
      }
    )
    .toPromise();
  const documentPath = documentPathResult.data?.documentPath as Folder[];
  return documentPath;
};
