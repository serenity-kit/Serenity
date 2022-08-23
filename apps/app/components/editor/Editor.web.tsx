import {
  Editor as SerenityEditor,
  EditorBottombarState,
  getEditorBottombarStateFromEditor,
  updateEditor,
} from "@serenity-tools/editor";
import { tw, View, useHasEditorSidebar } from "@serenity-tools/ui";
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
  const [isEditorBottombarVisible, setIsEditorBottombarVisible] =
    useState(false);
  const [editorBottombarState, setEditorBottombarState] =
    useState<EditorBottombarState>(initialEditorBottombarState);
  const tipTapEditorRef = useRef<TipTapEditor | null>(null);
  const editorBottombarRef = useRef<null | HTMLElement>(null);
  const hasEditorSidebar = useHasEditorSidebar();

  return (
    // needed so hidden elements with borders don't trigger scrolling behaviour
    <View style={tw`flex-1 overflow-hidden`}>
      <View
        style={{
          height: isEditorBottombarVisible
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
          onFocus={() => {
            setIsEditorBottombarVisible(true);
          }}
          onBlur={(params) => {
            if (
              !(
                params.event.relatedTarget &&
                "nodeType" in params.event.relatedTarget &&
                editorBottombarRef.current?.contains(params.event.relatedTarget)
              )
            ) {
              setIsEditorBottombarVisible(false);
            }
          }}
          onCreate={(params) => (tipTapEditorRef.current = params.editor)}
          onTransaction={(params) => {
            setEditorBottombarState(
              getEditorBottombarStateFromEditor(params.editor)
            );
          }}
        />
      </View>
      {!hasEditorSidebar && (
        <EditorBottombar
          ref={editorBottombarRef}
          editorBottombarState={editorBottombarState}
          onUpdate={(params) => {
            if (tipTapEditorRef.current) {
              updateEditor(tipTapEditorRef.current, params);
            }
          }}
        />
      )}
    </View>
  );
}
