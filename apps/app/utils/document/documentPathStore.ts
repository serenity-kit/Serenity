import { decryptFolder } from "@serenity-tools/common";
import { Client } from "urql";
import create from "zustand";
import {
  DocumentPathDocument,
  DocumentPathQuery,
  DocumentPathQueryVariables,
  Folder,
} from "../../generated/graphql";
import { getDevices } from "../device/getDevices";
import { getWorkspaceKey } from "../workspace/getWorkspaceKey";

interface DocumentPathState {
  folders: Folder[];
  folderIds: string[];
  folderNames: { [id: string]: string };
  getName: (folderId: string) => string;
  update: (folders: Folder[], urqlClient: Client) => Promise<void>;
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
    set(() => ({
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
