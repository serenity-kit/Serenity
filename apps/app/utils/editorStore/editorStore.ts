import { DocumentDecryptionState } from "@serenity-tools/secsync";
import create from "zustand";
import { DocumentState } from "../../types/documentState";

type SyncState =
  | { variant: "online" }
  | { variant: "offline"; pendingChanges: number }
  | {
      variant: "error";
      documentDecryptionState: DocumentDecryptionState;
      documentLoadedFromLocalDb: boolean;
    };

interface EditorState {
  isInEditingMode: boolean;
  syncState: SyncState;
  documentState: DocumentState;
  subscriptions: (() => void)[];
  setIsInEditingMode: (isInEditingMode: boolean) => void;
  setSyncState: (newSyncState: SyncState) => void;
  setDocumentState: (newDocumentState: DocumentState) => void;
  triggerBlur: () => void;
  subscribeToBlurTrigger: (callback: () => void) => void;
  removeAllSubscribers: () => void;
  snapshotKey: Uint8Array | null;
  setSnapshotKey: (snapshotKey: Uint8Array) => void;
  snapshotId: string | null;
  setSnapshotId: (snapshotid: string) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  syncState: { variant: "online" },
  documentState: "loading",
  subscriptions: [],
  subscribeToBlurTrigger: (callback) =>
    set((state) => ({
      ...state,
      subscriptions: state.subscriptions.concat([callback]),
    })),
  triggerBlur: () => {
    get().subscriptions.forEach((callback) => callback());
  },
  snapshotKey: null,
  snapshotId: null,
  setSnapshotKey: (snapshotKey) => {
    set(() => ({ snapshotKey }));
  },
  setSnapshotId: (snapshotId) => {
    set(() => ({ snapshotId }));
  },
  removeAllSubscribers: () => {
    set((state) => ({
      ...state,
      subscriptions: [],
    }));
  },
  isInEditingMode: false,
  setIsInEditingMode: (isInEditingMode) =>
    set((state) => ({
      isInEditingMode,
    })),
  setSyncState: (newSyncState) =>
    set((state) => ({
      syncState: newSyncState,
    })),
  setDocumentState: (newDocumentState) =>
    set((state) => ({
      documentState: newDocumentState,
    })),
}));
