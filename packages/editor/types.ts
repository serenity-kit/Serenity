import {
  InsertImageParams,
  UpdateFileAttributesParams,
} from "../editor-file-extension/src";

// needed to allow extending the global scope
export {};

export type EditorBottombarState = {
  isBold: boolean;
  isItalic: boolean;
  isCode: boolean;
  isLink: boolean;

  isHeading1: boolean;
  isHeading2: boolean;
  isHeading3: boolean;
  isCodeBlock: boolean;
  isBlockquote: boolean;

  isBulletList: boolean;
  isOrderedList: boolean;
  isTaskList: boolean;

  canUndo: boolean;
  canRedo: boolean;
};

type HighlightedCommentSource = "editor" | "sidebar";

type HighlightedComment = { id: string; source: HighlightedCommentSource };

export type UpdateEditorParams =
  | {
      variant: "toggle-bold";
    }
  | {
      variant: "toggle-italic";
    }
  | {
      variant: "toggle-code";
    }
  | {
      variant: "toggle-link";
    }
  | {
      variant: "toggle-heading-1";
    }
  | {
      variant: "toggle-heading-2";
    }
  | {
      variant: "toggle-heading-3";
    }
  | {
      variant: "toggle-code-block";
    }
  | {
      variant: "toggle-blockquote";
    }
  | {
      variant: "toggle-bullet-list";
    }
  | {
      variant: "toggle-ordered-list";
    }
  | {
      variant: "toggle-task-list";
    }
  | {
      variant: "insert-image";
      params: InsertImageParams;
    }
  | {
      variant: "update-image-attributes";
      params: UpdateFileAttributesParams;
    }
  | {
      variant: "undo";
    }
  | {
      variant: "redo";
    }
  | {
      variant: "update-comments";
      params: {
        decryptedComments: EditorComment[];
        highlightedComment: HighlightedComment | null;
      };
    };

export type UpdateEditor = (params: UpdateEditorParams) => void;

export type EditorComment = {
  id: string;
  from: number;
  to: number;
};

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
    username: string;
    updateEditor: (paramsString: string) => void;
    applyYjsUpdate: (update: any) => void;
    applyYAwarenessUpdate: (update: any) => void;
    blurEditor: () => void;
    resolveImageRequest: (fileId: string, base64: string) => void;
    rejectImageRequest: (fileId: string, reason: string) => void;
    updateUsername: (username: string) => void;
  }
}
