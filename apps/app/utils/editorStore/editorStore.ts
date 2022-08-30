import create from "zustand";

interface EditorState {
  isInEditingMode: boolean;
  subscriptions: (() => void)[];
  setIsInEditingMode: (isInEditingMode: boolean) => void;
  triggerBlur: () => void;
  subscribeToBlurTrigger: (callback: () => void) => void;
  removeAllSubscribers: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
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
}));
