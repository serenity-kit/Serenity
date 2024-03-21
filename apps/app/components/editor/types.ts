import { Awareness } from "y-protocols/awareness";
import * as Y from "yjs";
import { DocumentState } from "../../types/documentState";

export type EditorProps = {
  documentId: string;
  documentLoaded: boolean; // TODO move into documentState
  workspaceId: string;
  yDocRef: React.MutableRefObject<Y.Doc>;
  yAwarenessRef: React.MutableRefObject<Awareness>;
  isNew: boolean;
  openDrawer: () => void;
  updateTitle: (title: string) => void;
  editable: boolean;
  documentState: DocumentState;
  canComment: boolean;
  currentDeviceSigningPublicKey: string;
  documentShareLinkToken?: string;
};
