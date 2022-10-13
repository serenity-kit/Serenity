import create from "zustand";
import { Device } from "../../types/Device";
import { getWorkspaceKey as fetchWorkspaceKey } from "./getWorkspaceKey";

export type WorskpaceKeyLookup = {
  [workspaceKeyId: string]: string;
};
export type WorskpaceKeyLookupForWorkspace = {
  [workspaceId: string]: WorskpaceKeyLookup;
};
export type GetWorkspaceKeyProps = {
  workspaceId: string;
  workspaceKeyId: string;
  activeDevice: Device;
};
export type SetWorkspaceKeyProps = {
  workspaceId: string;
  workspaceKeyId: string;
  workspaceKey: string;
};
export type RemoveWorkspaceKeyProps = {
  workspaceId: string;
  workspaceKeyId: string;
  workspaceKey: string;
};

interface WorkspaceKeyState {
  workspaceKeyLookupForWorkspace: WorskpaceKeyLookupForWorkspace;
  getWorkspaceKey: ({
    workspaceId,
    workspaceKeyId,
    activeDevice,
  }: GetWorkspaceKeyProps) => Promise<string>;
  setWorkspaceKey: ({
    workspaceKeyId,
    workspaceKey,
  }: SetWorkspaceKeyProps) => Promise<void>;
  removeWorkspaceKey: ({
    workspaceId,
    workspaceKeyId,
  }: RemoveWorkspaceKeyProps) => Promise<void>;
  clear: () => void;
}

export const userWorkspaceKeyStore = create<WorkspaceKeyState>((set, get) => ({
  workspaceKeyLookupForWorkspace: {},
  getWorkspaceKey: async ({ workspaceId, workspaceKeyId, activeDevice }) => {
    const workspaceKeyLookupForWorkspace = get().workspaceKeyLookupForWorkspace;
    const workspaceKeyLookup = workspaceKeyLookupForWorkspace[workspaceId];
    if (!workspaceKeyLookup) {
      const workspaceKey = await fetchWorkspaceKey({
        workspaceId,
        activeDevice,
      });
      workspaceKeyLookupForWorkspace[workspaceId] = {
        workspaceKeyId: workspaceKey.workspaceKey,
      };
      set({ workspaceKeyLookupForWorkspace });
      return workspaceKey.workspaceKey;
    }
    const workspaceKeyString = workspaceKeyLookup[workspaceKeyId];
    if (!workspaceKeyString) {
      const workspaceKey = await fetchWorkspaceKey({
        workspaceId,
        activeDevice,
      });
      workspaceKeyLookupForWorkspace[workspaceId][workspaceKeyId] =
        workspaceKey.workspaceKey;
      set({ workspaceKeyLookupForWorkspace });
      return workspaceKey.workspaceKey;
    }
    return workspaceKeyString;
  },
  setWorkspaceKey: async ({ workspaceId, workspaceKeyId, workspaceKey }) => {
    // all documentPath folders should be in the same workspace
    const workspaceKeyLookupForWorkspace = get().workspaceKeyLookupForWorkspace;
    const workspaceKeyLookup = workspaceKeyLookupForWorkspace[workspaceId];
    if (!workspaceKeyLookup) {
      workspaceKeyLookupForWorkspace[workspaceId] = {};
    }
    workspaceKeyLookupForWorkspace[workspaceId][workspaceKeyId] = workspaceKey;
    set(() => ({
      workspaceKeyLookupForWorkspace,
    }));
  },
  removeWorkspaceKey: async ({ workspaceId, workspaceKeyId }) => {
    const workspaceKeyLookupForWorkspace = get().workspaceKeyLookupForWorkspace;
    if (!workspaceKeyLookupForWorkspace[workspaceId]) {
      return;
    }
    delete workspaceKeyLookupForWorkspace[workspaceId][workspaceKeyId];
    set(() => ({
      workspaceKeyLookupForWorkspace,
    }));
  },
  clear: () => {
    set(() => ({
      workspaceKeyLookupForWorkspace: {},
    }));
  },
}));
