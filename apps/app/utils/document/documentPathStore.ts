import {
  decryptFolderName,
  deriveKeysFromKeyDerivationTrace,
  LocalDevice,
} from "@serenity-tools/common";
import create from "zustand";
import {
  DocumentPathDocument,
  DocumentPathQuery,
  DocumentPathQueryVariables,
  Folder,
} from "../../generated/graphql";
import { getLocalOrLoadRemoteWorkspaceMemberDevicesProofQueryByHash } from "../../store/workspaceMemberDevicesProofStore";
import { GetFolderKeyProps } from "../folder/folderKeyStore";
import { isValidDeviceSigningPublicKey } from "../isValidDeviceSigningPublicKey/isValidDeviceSigningPublicKey";
import { getUrqlClient } from "../urqlClient/urqlClient";
import { getWorkspace } from "../workspace/getWorkspace";
import { retrieveWorkspaceKey } from "../workspace/retrieveWorkspaceKey";

interface DocumentPathState {
  folders: Folder[];
  folderIds: string[];
  folderNames: { [id: string]: string };
  getName: (folderId: string) => string;
  update: (
    folders: Folder[],
    activeDevice: LocalDevice,
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
    if (!workspaceId) {
      throw new Error("No workspaceId for this folder");
    }
    const workspaceKeyId = folders[0].keyDerivationTrace.workspaceKeyId;
    const workspace = await getWorkspace({
      workspaceId: workspaceId!,
      deviceSigningPublicKey: activeDevice.signingPublicKey,
    });
    if (!workspace?.workspaceKeys) {
      throw new Error("No workspace key for this workspace and device");
    }
    let folderWorkspaceKey: any = undefined;
    for (const workspaceKey of workspace.workspaceKeys!) {
      if (workspaceKey.id === workspaceKeyId) {
        folderWorkspaceKey = workspaceKey;
      }
    }
    if (!folderWorkspaceKey?.workspaceKeyBox) {
      console.error("Folder workspace key not found");
    }
    const workspaceKeyData = await retrieveWorkspaceKey({
      workspaceId: workspaceId!,
      workspaceKeyId,
      activeDevice,
    });
    const workspaceKey = workspaceKeyData.workspaceKey;
    for (let folder of folders) {
      folderIds.push(folder.id);
      let folderName = "loading…";
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
          workspaceKeyBox: folderWorkspaceKey.workspaceKeyBox!,
          workspaceId: workspaceId!,
          workspaceKeyId,
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

        const workspaceMemberDevicesProof =
          await getLocalOrLoadRemoteWorkspaceMemberDevicesProofQueryByHash({
            workspaceId,
            hash: folder.workspaceMemberDevicesProofHash,
          });
        if (!workspaceMemberDevicesProof) {
          throw new Error("workspaceMemberDevicesProof not found");
        }

        const isValid = isValidDeviceSigningPublicKey({
          signingPublicKey: folder.creatorDeviceSigningPublicKey,
          workspaceMemberDevicesProofEntry: workspaceMemberDevicesProof,
          workspaceId,
          minimumRole: "EDITOR",
        });
        if (!isValid) {
          throw new Error(
            "Invalid signing public key for the workspaceMemberDevicesProof"
          );
        }

        folderName = decryptFolderName({
          parentKey: parentKey,
          subkeyId: folderSubkeyId,
          ciphertext: folder.nameCiphertext,
          nonce: folder.nameNonce,
          signature: folder.signature,
          workspaceMemberDevicesProof: workspaceMemberDevicesProof.proof,
          folderId: folder.id,
          workspaceId,
          keyDerivationTrace: folder.keyDerivationTrace,
          creatorDeviceSigningPublicKey: folder.creatorDeviceSigningPublicKey,
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
