import { DocumentDecryptionState } from "@naisho/core";
import create from "zustand";

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
  subscriptions: (() => void)[];
  setIsInEditingMode: (isInEditingMode: boolean) => void;
  setSyncState: (offlineState: SyncState) => void;
  triggerBlur: () => void;
  subscribeToBlurTrigger: (callback: () => void) => void;
  removeAllSubscribers: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  syncState: { variant: "online" },
  subscriptions: [],
  subscribeToBlurTrigger: (callback) =>
    set((state) => ({
      ...state,
      subscriptions: state.subscriptions.concat([callback]),
    })),
  triggerBlur: () => {
    get().subscriptions.forEach((callback) => callback());
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
  setSyncState: (syncState) =>
    set((state) => ({
      syncState,
    })),
}));
