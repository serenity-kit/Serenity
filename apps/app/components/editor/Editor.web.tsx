import {
  Editor as SerenityEditor,
  EditorToolbarState,
  getEditorToolbarStateFromEditor,
  updateEditor,
} from "@serenity-tools/editor";
import { View } from "@serenity-tools/ui";
import { useRef, useState } from "react";
import { useWindowDimensions } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { Editor as TipTapEditor } from "@tiptap/core";
import {
  EditorBottomBar,
  editorToolbarHeight,
} from "../editorBottomBar/EditorBottomBar";
import { EditorProps } from "./types";
import { initialEditorToolbarState } from "./initialEditorToolbarState";

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
  const [editorToolbarState, setEditorToolbarState] =
    useState<EditorToolbarState>(initialEditorToolbarState);
  const tipTapEditorRef = useRef<TipTapEditor | null>(null);

  return (
    <>
      <View
        style={{
          height: isFocused
            ? dimensions.height - editorToolbarHeight - headerHeight
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
            // hack to avoid the EditorBottomBar to disappear before
            // the click on it can be recognized
            () =>
              setTimeout(() => {
                setIsFocused(false);
              }, 0)
          }
          onCreate={(params) => (tipTapEditorRef.current = params.editor)}
          onTransaction={(params) => {
            setEditorToolbarState(
              getEditorToolbarStateFromEditor(params.editor)
            );
          }}
        />
      </View>
      <EditorBottomBar
        editorToolbarState={editorToolbarState}
        onUpdate={(params) => {
          if (tipTapEditorRef.current) {
            updateEditor(tipTapEditorRef.current, params);
            // cleanup hack for the onBlur hack to make sure the
            // EditorBottomBar stays visible
            setTimeout(() => {
              setIsFocused(true);
            }, 0);
          }
        }}
      />
    </>
  );
}
