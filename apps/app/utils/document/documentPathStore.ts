import {
  decryptFolderName,
  deriveKeysFromKeyDerivationTrace,
} from "@serenity-tools/common";
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
import { deriveWorkspaceKey } from "../workspace/deriveWorkspaceKey";
import { getWorkspace } from "../workspace/getWorkspace";

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
    const workspaceId = folders[0].workspaceId;
    const workspace = await getWorkspace({
      workspaceId: workspaceId!,
      deviceSigningPublicKey: activeDevice.signingPublicKey,
    });
    if (!workspace?.currentWorkspaceKey) {
      throw new Error("No workspace key for this workspace and device");
    }
    const workspaceKeyData = await deriveWorkspaceKey({
      workspaceId: workspaceId!,
      workspaceKeyId: workspace.currentWorkspaceKey.id,
      activeDevice,
    });
    const workspaceKey = workspaceKeyData.workspaceKey;
    for (let folder of folders) {
      folderIds.push(folder.id);
      let folderName = "decrypting…";
      try {
        const parentKeyTrace = deriveKeysFromKeyDerivationTrace({
          keyDerivationTrace: folder.keyDerivationTrace,
          activeDevice: {
            signingPublicKey: activeDevice.signingPublicKey,
            signingPrivateKey: activeDevice.signingPrivateKey!,
            encryptionPublicKey: activeDevice.encryptionPublicKey,
            encryptionPrivateKey: activeDevice.encryptionPrivateKey!,
            encryptionPublicKeySignature:
              activeDevice.encryptionPublicKeySignature!,
          },
          workspaceKeyBox: workspace.currentWorkspaceKey.workspaceKeyBox!,
        });
        // since decryptFolderName also derives the folder subkey,
        // we can pass the parentKeyTrace's parent key to it
        const folderSubkeyId =
          folder.keyDerivationTrace.trace[
            folder.keyDerivationTrace.trace.length - 1
          ].subkeyId;
        let parentKey = workspaceKey;
        if (parentKeyTrace.trace.length > 1) {
          parentKey = parentKeyTrace.trace[parentKeyTrace.trace.length - 2].key;
        }
        folderName = decryptFolderName({
          parentKey: parentKey,
          subkeyId: folderSubkeyId,
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
