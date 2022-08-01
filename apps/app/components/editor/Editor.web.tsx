import {
  Editor as SerenityEditor,
  EditorBottombarState,
  getEditorBottombarStateFromEditor,
  updateEditor,
} from "@serenity-tools/editor";
import { View } from "@serenity-tools/ui";
import { useRef, useState } from "react";
import { useWindowDimensions } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { Editor as TipTapEditor } from "@tiptap/core";
import {
  EditorBottombar,
  editorBottombarHeight,
} from "../editorBottombar/EditorBottombar";
import { EditorProps } from "./types";
import { initialEditorBottombarState } from "./initialEditorBottombarState";

export default function Editor({
  yDocRef,
  yAwarenessRef,
  openDrawer,
  documentId,
  isNew,
  updateTitle,
}: EditorProps) {
  const headerHeight = useHeaderHeight();
  const dimensions = useWindowDimensions();
  const [isFocused, setIsFocused] = useState(false);
  const [editorBottombarState, setEditorBottombarState] =
    useState<EditorBottombarState>(initialEditorBottombarState);
  const tipTapEditorRef = useRef<TipTapEditor | null>(null);

  return (
    <>
      <View
        style={{
          height: isFocused
            ? dimensions.height - editorBottombarHeight - headerHeight
            : undefined,
        }}
      >
        <SerenityEditor
          documentId={documentId}
          yDocRef={yDocRef}
          yAwarenessRef={yAwarenessRef}
          isNew={isNew}
          openDrawer={openDrawer}
          updateTitle={updateTitle}
          onFocus={() => setIsFocused(true)}
          onBlur={
            // hack to avoid the EditorBottombar to disappear before
            // the click on it can be recognized
            () =>
              setTimeout(() => {
                setIsFocused(false);
              }, 0)
          }
          onCreate={(params) => (tipTapEditorRef.current = params.editor)}
          onTransaction={(params) => {
            setEditorBottombarState(
              getEditorBottombarStateFromEditor(params.editor)
            );
          }}
        />
      </View>
      <EditorBottombar
        editorBottombarState={editorBottombarState}
        onUpdate={(params) => {
          if (tipTapEditorRef.current) {
            updateEditor(tipTapEditorRef.current, params);
            // cleanup hack for the onBlur hack to make sure the
            // EditorBottombar stays visible
            setTimeout(() => {
              setIsFocused(true);
            }, 0);
          }
        }}
      />
    </>
  );
}
