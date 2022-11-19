import create from "zustand";
import { Device } from "../../types/Device";
import { getWorkspace } from "../workspace/getWorkspace";
import { deriveFolderKey } from "./deriveFolderKeyData";
import { getFolder } from "./getFolder";

/*
workspaceId
 - workspaceKeyId
    - folderId
        - folderSubkeyId
*/

export type FolderSubkeyKeyLookup = {
  [folderSubkeyId: number]: string;
};
export type FolderIdSubkeyLookup = {
  [folderId: string]: FolderSubkeyKeyLookup;
};
export type FolderWorkspaceKeyIdLookup = {
  [workspaceKeyId: string]: FolderIdSubkeyLookup;
};
export type FolderKeyLookupForWorkspace = {
  [workspaceId: string]: FolderIdSubkeyLookup;
};

export type GetFolderKeyProps = {
  workspaceId: string;
  workspaceKeyId: string | undefined | null;
  folderId: string;
  folderSubkeyId?: number | undefined | null;
  activeDevice: Device;
};
// export type SetFolderKeyProps = {
//   folderId: string;
//   workspaceId: string;
//   workspaceSubkeyId: string;
//   folderSubkeyId: number;
// };
// export type RemoveFolderKeyKeyProps = {
//   workspaceId: string;
//   folderSubkeyId: string;
//   workspaceKeyId: string;
// };

interface FolderKeyState {
  folderKeyLookupForWorkspace: FolderKeyLookupForWorkspace;
  getFolderKey: ({
    workspaceId,
    workspaceKeyId,
    folderId,
    folderSubkeyId,
    activeDevice,
  }: GetFolderKeyProps) => Promise<string>;
  // TODO: setFolderKey
  clear: () => void;
}

export const useFolderKeyStore = create<FolderKeyState>((set, get) => ({
  folderKeyLookupForWorkspace: {},
  getFolderKey: async ({
    workspaceId,
    workspaceKeyId,
    folderId,
    folderSubkeyId,
    activeDevice,
  }: GetFolderKeyProps): Promise<string> => {
    let usingWorkspaceKeyId = workspaceKeyId;
    if (!usingWorkspaceKeyId) {
      const workspace = await getWorkspace({
        workspaceId,
        deviceSigningPublicKey: activeDevice.signingPublicKey,
      });
      if (!workspace?.currentWorkspaceKey) {
        throw new Error("Workspace key not found");
      }
      usingWorkspaceKeyId = workspace.currentWorkspaceKey.id;
    }
    const folderKeyLookupForWorkspace = get().folderKeyLookupForWorkspace;
    let folderIdSubkeyLookup = folderKeyLookupForWorkspace[workspaceId];
    if (!folderIdSubkeyLookup) {
      folderKeyLookupForWorkspace[workspaceId] = {};
      folderIdSubkeyLookup = folderKeyLookupForWorkspace[workspaceId];
    }
    let folderWorkspaceKeyIdLookup = folderIdSubkeyLookup[usingWorkspaceKeyId];
    if (!folderWorkspaceKeyIdLookup) {
      folderIdSubkeyLookup[usingWorkspaceKeyId] = {};
      folderWorkspaceKeyIdLookup = folderIdSubkeyLookup[usingWorkspaceKeyId];
    }
    let folderSubkeyKeyLookup = folderWorkspaceKeyIdLookup[folderId];
    if (!folderSubkeyKeyLookup) {
      folderWorkspaceKeyIdLookup[folderId] = {};
      folderSubkeyKeyLookup = folderWorkspaceKeyIdLookup[folderId];
    }
    let usingFolderSubkeyId = folderSubkeyId;
    if (usingFolderSubkeyId === undefined) {
      const folder = await getFolder({ id: folderId });
      usingFolderSubkeyId = folder.keyDerivationTrace.subkeyId;
    }
    let folderKey = folderSubkeyKeyLookup[folderSubkeyId];
    if (folderKey) {
      return folderKey;
    }
    const folder = await getFolder({ id: folderId });
    // TODO: optimize by creating a single graphql query to get all folders
    const derivedFolderKeyData = await deriveFolderKey({
      folderId,
      keyDerivationTrace: folder.keyDerivationTrace,
      activeDevice,
    });
    folderKey = derivedFolderKeyData[derivedFolderKeyData.length - 1].key;
    let remainingFolderKeyData = [...derivedFolderKeyData];
    // the first key in the trace is the workspace key
    while (remainingFolderKeyData.length > 1) {
      const lastFolderKeyData =
        remainingFolderKeyData[remainingFolderKeyData.length - 1];
      const traceFolderId = lastFolderKeyData.folderId;
      if (!folderWorkspaceKeyIdLookup[traceFolderId!]) {
        folderWorkspaceKeyIdLookup[traceFolderId!] = {};
      }
      folderWorkspaceKeyIdLookup[traceFolderId!][lastFolderKeyData.subkeyId] =
        lastFolderKeyData.key;
      remainingFolderKeyData = [...derivedFolderKeyData];
      remainingFolderKeyData.pop();
    }
    set({ folderKeyLookupForWorkspace });
    return folderKey;
  },
  clear: () => {
    set(() => ({
      folderKeyLookupForWorkspace: {},
    }));
  },
}));
