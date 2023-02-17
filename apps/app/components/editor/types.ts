import { EditorComment } from "@serenity-tools/editor";
import { Awareness } from "y-protocols/awareness";
import * as Y from "yjs";

export type EditorProps = {
  documentId: string;
  documentLoaded: boolean;
  workspaceId: string;
  yDocRef: React.MutableRefObject<Y.Doc>;
  yAwarenessRef: React.MutableRefObject<Awareness>;
  isNew: boolean;
  username: string;
  openDrawer: () => void;
  updateTitle: (title: string) => void;
  comments: EditorComment[];
  highlightedCommentId: string | null;
};
