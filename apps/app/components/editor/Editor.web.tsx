import {
  Editor as SerenityEditor,
  EditorBottombarState,
  getEditorBottombarStateFromEditor,
  updateEditor,
} from "@serenity-tools/editor";
import { tw, useHasEditorSidebar, View } from "@serenity-tools/ui";
import { Editor as TipTapEditor } from "@tiptap/core";
import { useEffect, useRef, useState } from "react";
import { View as RNView } from "react-native";
import {
  EditorBottombar,
  editorBottombarHeight,
} from "../editorBottombar/EditorBottombar";
import { initialEditorBottombarState } from "./initialEditorBottombarState";
import { EditorProps } from "./types";

export default function Editor({
  yDocRef,
  yAwarenessRef,
  openDrawer,
  documentId,
  isNew,
  updateTitle,
}: EditorProps) {
  const [editorBottombarState, setEditorBottombarState] =
    useState<EditorBottombarState>(initialEditorBottombarState);
  const tipTapEditorRef = useRef<TipTapEditor | null>(null);
  const editorBottombarRef = useRef<null | HTMLElement>(null);
  const hasEditorSidebar = useHasEditorSidebar();
  const editorBottombarWrapperRef = useRef<RNView>(null);
  const editorIsFocusedRef = useRef<boolean>(false);

  useEffect(() => {
    const showAndPositionToolbar = function () {
      if (editorBottombarWrapperRef.current && editorIsFocusedRef.current) {
        const topPos =
          // @ts-expect-error - only works in web only
          window.visualViewport.height +
          window.pageYOffset -
          editorBottombarHeight +
          2;
        // @ts-expect-error - this is a div
        editorBottombarWrapperRef.current.style.top = `${topPos}px`;
        // @ts-expect-error - this is a div
        editorBottombarWrapperRef.current.style.display = "block";
      }
    };

    // @ts-expect-error - only works in web only
    window.visualViewport.addEventListener("resize", showAndPositionToolbar);

    return () =>
      // @ts-expect-error - only works in web only
      window.visualViewport.removeEventListener(
        "resize",
        showAndPositionToolbar
      );
  }, []);

  return (
    // needed so hidden elements with borders don't trigger scrolling behaviour
    <View style={tw`flex-1 overflow-hidden`}>
      <View>
        <SerenityEditor
          documentId={documentId}
          yDocRef={yDocRef}
          yAwarenessRef={yAwarenessRef}
          isNew={isNew}
          openDrawer={openDrawer}
          updateTitle={updateTitle}
          onFocus={() => {
            editorIsFocusedRef.current = true;
          }}
          onBlur={(params) => {
            if (
              !(
                params.event.relatedTarget &&
                "nodeType" in params.event.relatedTarget &&
                editorBottombarRef.current?.contains(params.event.relatedTarget)
              )
            ) {
              editorIsFocusedRef.current = false;
              if (editorBottombarWrapperRef.current) {
                editorBottombarWrapperRef.current.style.display = "none";
              }
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
        <View
          ref={editorBottombarWrapperRef}
          style={{
            position: "absolute",
            display: "none",
          }}
        >
          <EditorBottombar
            ref={editorBottombarRef}
            editorBottombarState={editorBottombarState}
            onUpdate={(params) => {
              if (tipTapEditorRef.current) {
                updateEditor(tipTapEditorRef.current, params);
              }
            }}
          />
        </View>
      )}
    </View>
  );
}
