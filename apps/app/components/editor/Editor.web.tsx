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
import { downloadFileBase64Bytes } from "../../utils/file/downloadFileBase64Bytes";
import {
  EditorBottombar,
  editorBottombarHeight,
} from "../editorBottombar/EditorBottombar";
import { encryptAndUpload } from "./encryptAndUpload";
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

  const positionToolbar = () => {
    if (editorBottombarWrapperRef.current && editorIsFocusedRef.current) {
      const topPos =
        // @ts-expect-error - works in web only
        window.visualViewport.height +
        window.scrollY - // needed for iOS safari scroll page offset
        editorBottombarHeight -
        48 + // header height (top-bar) since it's 3 rem
        2;
      // @ts-expect-error - this is a div
      editorBottombarWrapperRef.current.style.top = `${topPos}px`;
    }
  };

  const showAndPositionToolbar = function () {
    if (editorBottombarWrapperRef.current && editorIsFocusedRef.current) {
      positionToolbar();
      // @ts-expect-error - this is a div
      editorBottombarWrapperRef.current.style.display = "block";
    }
  };

  useEffect(() => {
    // @ts-expect-error - works in web only
    window.visualViewport.addEventListener("resize", showAndPositionToolbar);
    window.addEventListener("scroll", positionToolbar);

    return () => {
      // @ts-expect-error - works in web only
      window.visualViewport.removeEventListener(
        "resize",
        showAndPositionToolbar
      );
      window.removeEventListener("scroll", positionToolbar);
    };
  }, []);

  return (
    // overflow-hidden needed so hidden elements with borders don't trigger scrolling behaviour
    <View style={tw`overflow-hidden`}>
      <View>
        <SerenityEditor
          documentId={documentId}
          yDocRef={yDocRef}
          yAwarenessRef={yAwarenessRef}
          isNew={isNew}
          openDrawer={openDrawer}
          updateTitle={updateTitle}
          downloadAndDecryptFile={downloadFileBase64Bytes}
          onFocus={() => {
            editorIsFocusedRef.current = true;
            showAndPositionToolbar();
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
                // @ts-expect-error - it's a div
                editorBottombarWrapperRef.current.style.display = "none";
              }
            }
          }}
          onCreate={(params) => {
            tipTapEditorRef.current = params.editor;
          }}
          onTransaction={(params) => {
            setEditorBottombarState(
              getEditorBottombarStateFromEditor(params.editor)
            );
          }}
          encryptAndUpload={encryptAndUpload}
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
            encryptAndUpload={encryptAndUpload}
          />
        </View>
      )}
    </View>
  );
}
