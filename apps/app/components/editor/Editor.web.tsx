import {
  EditorBottombarState,
  Editor as SerenityEditor,
  UpdateEditorParams,
  getEditorBottombarStateFromEditor,
  updateEditor,
} from "@serenity-tools/editor";
import { View, tw, useHasEditorSidebar } from "@serenity-tools/ui";
import { Editor as TipTapEditor } from "@tiptap/core";
import { useActor } from "@xstate/react";
import { Packer } from "docx";
import { DocxSerializer, defaultMarks, defaultNodes } from "prosemirror-docx";
import { useEffect, useMemo, useRef, useState } from "react";
import { View as RNView } from "react-native";
import { usePage } from "../../context/PageContext";
import { editorToolbarService } from "../../machines/editorToolbarMachine";
import { useWorkspaceMemberDevicesToUsernames } from "../../store/workspaceStore";
import { useEditorStore } from "../../utils/editorStore/editorStore";
import { createDownloadAndDecryptFileFunction } from "../../utils/file/createDownloadAndDecryptFileFunction";
import { createEncryptAndUploadFileFunction } from "../../utils/file/createEncryptAndUploadFileFunction";
import {
  EditorBottombar,
  editorBottombarHeight,
} from "../editorBottombar/EditorBottombar";
import { EditorLoading } from "../editorLoading/EditorLoading";
import { initialEditorBottombarState } from "./initialEditorBottombarState";
import { EditorProps } from "./types";

// tiptap has these camelCased
const nodeSerializer = {
  ...defaultNodes,
  hardBreak: defaultNodes.hard_break,
  codeBlock: defaultNodes.code_block,
  orderedList: defaultNodes.ordered_list,
  taskList: defaultNodes.bullet_list,
  taskItem: defaultNodes.list_item,
  listItem: defaultNodes.list_item,
  bulletList: defaultNodes.bullet_list,
  horizontalRule: defaultNodes.horizontal_rule,
  file(state, node) {
    // if (node.attrs.subtype === "image") {
    //   // image
    //   state.image(node.attrs.src);
    //   state.closeBlock(node);
    //   return;
    // }
    // console.log(node);
    // console.log(state);

    // state.renderInline(node);
    state.closeBlock(node);
  },
};

const myDocxSerializer = new DocxSerializer(nodeSerializer, defaultMarks);

export default function Editor({
  yDocRef,
  yAwarenessRef,
  openDrawer,
  documentId,
  documentLoaded,
  workspaceId,
  isNew,
  updateTitle,
  editable,
  documentState,
  canComment,
  documentShareLinkToken,
}: EditorProps) {
  const [editorBottombarState, setEditorBottombarState] =
    useState<EditorBottombarState>(initialEditorBottombarState);
  const tipTapEditorRef = useRef<TipTapEditor | null>(null);
  const editorBottombarRef = useRef<null | HTMLElement>(null);
  const hasEditorSidebar = useHasEditorSidebar();
  const editorBottombarWrapperRef = useRef<RNView>(null);
  const editorIsFocusedRef = useRef(false);
  const wasNewOnFirstRender = useRef(isNew);
  const setIsInEditingMode = useEditorStore(
    (state) => state.setIsInEditingMode
  );
  const setExportWordDoc = useEditorStore((state) => state.setExportWordDoc);

  const { commentsService } = usePage();
  const [commentsState, send] = useActor(commentsService);

  const workspaceDevicesToUsernames = useWorkspaceMemberDevicesToUsernames({
    workspaceId,
  });

  // hasOpenCommentsSidebarRef is a hack needed since the shouldShow prop
  // of the BubbleMenu seems to be cached internally in the BubbleMenu component
  // and new props are not tacking into account.
  const hasOpenCommentsSidebarRef = useRef(commentsState.context.isOpenSidebar);
  hasOpenCommentsSidebarRef.current = commentsState.context.isOpenSidebar;

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

    const onEventListener = (args) => {
      let params: UpdateEditorParams | null = null;
      if (args.type === "UNDO") {
        params = { variant: "undo" };
      } else if (args.type === "REDO") {
        params = { variant: "redo" };
      }
      if (params && tipTapEditorRef.current) {
        updateEditor(tipTapEditorRef.current, params);
      }
    };

    editorToolbarService.onEvent(onEventListener);
    setExportWordDoc(async () => {
      if (!tipTapEditorRef.current) {
        return null;
      }

      const opts = {
        getImageBuffer(src: string) {
          return Buffer.from("real buffer here");
        },
      };

      const wordDocument = myDocxSerializer.serialize(
        tipTapEditorRef.current?.state.doc,
        opts
      );

      const blob = await Packer.toBlob(wordDocument);
      // create a URL for the blob
      const url = URL.createObjectURL(blob);

      // create a temporary anchor element and trigger the download
      const a = document.createElement("a");
      a.href = url;
      a.download = "example.docx";
      document.body.appendChild(a); // append to the body
      a.click(); // simulate a click on the element
      // clean up: remove the element and revoke the URL
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });

    return () => {
      // @ts-expect-error - works in web only
      window.visualViewport.removeEventListener(
        "resize",
        showAndPositionToolbar
      );
      window.removeEventListener("scroll", positionToolbar);
      editorToolbarService.off(onEventListener);
    };
  }, []);

  const encryptAndUploadFile = useMemo(() => {
    return createEncryptAndUploadFileFunction({
      workspaceId,
      documentId,
    });
  }, [workspaceId, documentId]);

  const downloadAndDecryptFile = useMemo(() => {
    return createDownloadAndDecryptFileFunction({
      documentId,
      documentShareLinkToken,
    });
  }, [documentId, documentShareLinkToken]);

  if (!documentLoaded) {
    return <EditorLoading />;
  }

  return (
    // overflow-hidden needed so hidden elements with borders don't trigger scrolling behaviour
    <View style={tw`h-full overflow-hidden`}>
      <div
        id="pdf-export-container"
        style={{
          width: 794 /* ~210mm */,
          position: "absolute" /* To avoid affecting layout */,
          left: -10000 /* Move off-screen */,
          paddingLeft: 40,
          paddingRight: 40,
        }}
      ></div>
      <SerenityEditor
        editable={editable}
        canComment={canComment}
        documentId={documentId}
        yDocRef={yDocRef}
        yAwarenessRef={yAwarenessRef}
        isNew={wasNewOnFirstRender.current}
        openDrawer={openDrawer}
        updateTitle={updateTitle}
        downloadAndDecryptFile={downloadAndDecryptFile}
        comments={commentsState.context.decryptedComments}
        workspaceDevicesToUsernames={workspaceDevicesToUsernames}
        createComment={(comment) => {
          send({
            type: "CREATE_COMMENT",
            text: comment.text,
            from: comment.from,
            to: comment.to,
          });
        }}
        highlightComment={(commentId, openSidebar) => {
          // necessary check to avoid an endless loop
          send({
            type: "HIGHLIGHT_COMMENT_FROM_EDITOR",
            commentId: commentId === null ? "NONE" : commentId, // there is a bug with setting it to null
            openSidebar: openSidebar || false,
          });
        }}
        highlightedComment={commentsState.context.highlightedComment}
        hasOpenCommentsSidebar={() => {
          return hasOpenCommentsSidebarRef.current;
        }}
        onFocus={() => {
          editorIsFocusedRef.current = true;
          showAndPositionToolbar();
          setIsInEditingMode(true);
        }}
        onBlur={(params) => {
          if (
            !(
              params.event.relatedTarget &&
              "nodeType" in params.event.relatedTarget &&
              // check if click was not inside the editor bottom bar
              (editorBottombarRef.current?.contains(
                // @ts-expect-error
                params.event.relatedTarget
              ) ||
                // check if click was not inside editor buttons e.g. undo/redo
                // @ts-expect-error
                params.event.relatedTarget.dataset.editorButton === "true")
            )
          ) {
            editorIsFocusedRef.current = false;
            if (editorBottombarWrapperRef.current) {
              // @ts-expect-error - it's a div
              editorBottombarWrapperRef.current.style.display = "none";
            }
            setIsInEditingMode(false);
          }
        }}
        onCreate={(params) => {
          tipTapEditorRef.current = params.editor;
        }}
        onTransaction={(params) => {
          const toolbarState = getEditorBottombarStateFromEditor(params.editor);
          setEditorBottombarState(toolbarState);
          editorToolbarService.send("updateToolbarState", { toolbarState });
        }}
        encryptAndUploadFile={encryptAndUploadFile}
        shareOrSaveFile={({
          mimeType,
          contentAsBase64,
          fileName: shareFileName,
        }) => {
          const dataUri = `data:${mimeType};base64,${contentAsBase64}`;
          const element = document.createElement("a");
          element.setAttribute("href", dataUri);
          element.setAttribute("download", shareFileName);
          element.style.display = "none";
          document.body.appendChild(element);
          element.click();
          document.body.removeChild(element);
        }}
        documentState={documentState}
      />
      {!hasEditorSidebar && editable && (
        <View
          ref={editorBottombarWrapperRef}
          style={{
            position: "absolute",
            display: "none",
            width: "100%",
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
            encryptAndUploadFile={encryptAndUploadFile}
            documentState={documentState}
          />
        </View>
      )}
    </View>
  );
}
