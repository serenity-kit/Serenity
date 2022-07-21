// needed to allow extending the global scope
export {};

export type EditorToolbarState = {
  isBold: boolean;
  isItalic: boolean;
};

export type UpdateEditorParams =
  | {
      variant: "toggle-bold";
    }
  | {
      variant: "toggle-italic";
    };

export type UpdateEditor = (params: UpdateEditorParams) => void;

type ReactNativeWebView = {
  postMessage: (message: string) => void;
};

declare global {
  interface Window {
    ReactNativeWebView: ReactNativeWebView;
    ydoc: any;
    editor: any;
    isNew: boolean;
    initialContent: any;
    updateEditor: (paramsString: string) => void;
    applyYjsUpdate: (update: any) => void;
    applyYAwarenessUpdate: (update: any) => void;
  }
}
