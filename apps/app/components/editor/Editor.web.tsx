import { Editor as SerenityEditor } from "@serenity-tools/editor";
import { EditorProps } from "./types";

export default function Editor({
  yDocRef,
  yAwarenessRef,
  openDrawer,
  documentId,
  autofocus,
}: EditorProps) {
  return (
    <SerenityEditor
      documentId={documentId}
      yDocRef={yDocRef}
      yAwarenessRef={yAwarenessRef}
      autofocus={autofocus}
      openDrawer={openDrawer}
    />
  );
}
