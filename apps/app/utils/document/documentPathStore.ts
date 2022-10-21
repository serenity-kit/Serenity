import { decryptFolderName } from "@serenity-tools/common";
import create from "zustand";
import {
  DocumentPathDocument,
  DocumentPathQuery,
  DocumentPathQueryVariables,
  Folder,
} from "../../generated/graphql";
import { Device } from "../../types/Device";
import { GetFolderKeyProps } from "../folder/folderKeyStore";
import { getUrqlClient } from "../urqlClient/urqlClient";
import { getWorkspaceKeys } from "../workspace/getWorskpaceKeys";

interface DocumentPathState {
  folders: Folder[];
  folderIds: string[];
  folderNames: { [id: string]: string };
  getName: (folderId: string) => string;
  update: (
    folders: Folder[],
    activeDevice: Device,
    getFolderKey: ({
      workspaceId,
      workspaceKeyId,
      folderId,
      folderSubkeyId,
      activeDevice,
    }: GetFolderKeyProps) => Promise<string>
  ) => Promise<void>;
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
  update: async (folders, activeDevice, getFolderKey) => {
    // all documentPath folders should be in the same workspace
    const folderIds: string[] = [];
    const folderNames: { [id: string]: string } = {};
    for (let folder of folders) {
      folderIds.push(folder.id);
      let folderName = "decrypting…";
      try {
        // TODO: optimize key derivation to look up
        // parent keys and workspace keys more easily
        let parentKey = "";
        if (folder.parentFolderId) {
          parentKey = await getFolderKey({
            workspaceId: folder.workspaceId!,
            workspaceKeyId: folder.workspaceKeyId,
            folderId: folder.parentFolderId,
            activeDevice,
          });
        } else {
          const workspaceKeys = await getWorkspaceKeys({
            workspaceId: folder.workspaceId!,
            activeDevice,
          });
          if (!workspaceKeys[folder.workspaceKeyId!]) {
            throw new Error("Workspace key not found");
          }
          parentKey = workspaceKeys[folder.workspaceKeyId!];
        }
        folderName = await decryptFolderName({
          parentKey: parentKey,
          subkeyId: folder.subkeyId!,
          ciphertext: folder.encryptedName,
          publicNonce: folder.encryptedNameNonce,
        });
      } catch (error) {
        console.error(error);
        folderName = "decryption error";
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
  documentId: string
): Promise<Folder[]> => {
  const documentPathResult = await getUrqlClient()
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
