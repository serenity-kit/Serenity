import { Editor as SerenityEditor } from "@serenity-tools/editor";
import { EditorBottomBar } from "../editorBottomBar/EditorBottomBar";
import { EditorProps } from "./types";

export default function Editor({
  yDocRef,
  yAwarenessRef,
  openDrawer,
  documentId,
  isNew,
  updateTitle,
}: EditorProps) {
  return (
    <>
      <SerenityEditor
        documentId={documentId}
        yDocRef={yDocRef}
        yAwarenessRef={yAwarenessRef}
        isNew={isNew}
        openDrawer={openDrawer}
        updateTitle={updateTitle}
      />
      {/* TODO */}
      {/* <EditorBottomBar
        editorToolbarState={{ isBold: false, isItalic: false }}
        onUpdate={() => undefined}
      /> */}
    </>
  );
}
