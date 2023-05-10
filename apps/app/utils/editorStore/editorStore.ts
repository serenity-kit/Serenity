import create from "zustand";

interface EditorState {
  isInEditingMode: boolean;
  isOffline: boolean;
  subscriptions: (() => void)[];
  setIsInEditingMode: (isInEditingMode: boolean) => void;
  setIsOffline: (isOffline: boolean) => void;
  triggerBlur: () => void;
  subscribeToBlurTrigger: (callback: () => void) => void;
  removeAllSubscribers: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  isOffline: false,
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
  setIsOffline: (isOffline) =>
    set((state) => ({
      isOffline,
    })),
}));
