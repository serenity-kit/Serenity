import { Awareness } from "y-protocols/awareness";
import * as Y from "yjs";

export type EditorProps = {
  documentId: string;
  yDocRef: React.MutableRefObject<Y.Doc>;
  yAwarenessRef?: React.MutableRefObject<Awareness>;
  isNew: boolean;
  openDrawer: () => void;
};
