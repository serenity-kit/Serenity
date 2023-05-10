import create from "zustand";

type OfflineState = false | { pendingChanges: number };

interface EditorState {
  isInEditingMode: boolean;
  offlineState: OfflineState;
  subscriptions: (() => void)[];
  setIsInEditingMode: (isInEditingMode: boolean) => void;
  setOfflineState: (offlineState: OfflineState) => void;
  triggerBlur: () => void;
  subscribeToBlurTrigger: (callback: () => void) => void;
  removeAllSubscribers: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  offlineState: false,
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
  setOfflineState: (offlineState) =>
    set((state) => ({
      offlineState,
    })),
}));
