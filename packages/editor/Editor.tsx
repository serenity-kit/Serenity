import {
  BoxShadow,
  EditorBottombarDivider,
  RawInput,
  SubmitButton,
  ScrollView,
  tw,
  useHasEditorSidebar,
  View,
  ToggleButton,
} from "@serenity-tools/ui";
import { EditorEvents, isTextSelection } from "@tiptap/core";
import Collaboration from "@tiptap/extension-collaboration";
import { Level } from "@tiptap/extension-heading";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import { BubbleMenu, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { HStack, VStack } from "native-base";
import React, { useEffect, useRef, useState } from "react";
import {
  absolutePositionToRelativePosition,
  ySyncPluginKey,
} from "y-prosemirror";
import { Awareness } from "y-protocols/awareness";
import * as Y from "yjs";
import {
  DownloadAndDecryptFileFunction,
  EncryptAndUploadFunctionFile,
  FileNodeExtension,
  ShareOrSaveFileFunction,
} from "../editor-file-extension/src";
import "./awareness.css";
import { CommentsExtension } from "./comments-extension/comments-extension";
import EditorSidebar from "./components/editorSidebar/EditorSidebar";
import "./editor-output.css";
import { AwarnessExtension } from "./naisho-awareness-extension";
import { SerenityScrollIntoViewForEditModeExtension } from "./scroll-into-view-for-edit-mode-extensions";
import { EditorComment } from "./types";

type EditorProps = {
  documentId: string;
  yDocRef: React.MutableRefObject<Y.Doc>;
  yAwarenessRef: React.MutableRefObject<Awareness>;
  isNew?: boolean;
  scrollIntoViewOnEditModeDelay?: number;
  openDrawer: () => void;
  updateTitle: (title: string) => void;
  onTransaction?: (params: EditorEvents["transaction"]) => void;
  onFocus?: (params: EditorEvents["focus"]) => void;
  onBlur?: (params: EditorEvents["blur"]) => void;
  onCreate?: (params: EditorEvents["create"]) => void;
  encryptAndUploadFile: EncryptAndUploadFunctionFile;
  downloadAndDecryptFile: DownloadAndDecryptFileFunction;
  shareOrSaveFile: ShareOrSaveFileFunction;
  comments: EditorComment[];
  createComment: (comment: { from: number; to: number; text: string }) => void;
  highlightComment: (commentId: string | null) => void;
  highlightedCommentId: string | null;
};

const headingLevels: Level[] = [1, 2, 3];

export const Editor = (props: EditorProps) => {
  const hasEditorSidebar = useHasEditorSidebar();
  // using the state here since it's only true on the first render
  const [isNew] = useState(props.isNew ?? false);
  const [hasCreateCommentBubble, setHasCreateCommentBubble] = useState(false);
  const [commentText, setCommentText] = useState("");

  const newTitleRef = useRef("");
  const shouldCommitNewTitleRef = useRef(isNew);
  const scrollIntoViewOnEditModeDelay =
    props.scrollIntoViewOnEditModeDelay ?? 150; // 150ms works well on iOS Safari
  const bubbleMenuRef = useRef<HTMLDivElement>(null);

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          // the Collaboration extension comes with its own history handling
          history: false,
          code: {
            HTMLAttributes: {
              class: "code-extension",
            },
          },
          codeBlock: {
            HTMLAttributes: {
              class: "code-block-extension",
            },
          },
          heading: {
            levels: headingLevels,
          },
        }),
        Link.configure({
          openOnClick: false,
        }),
        Placeholder.configure({
          placeholder: ({ node }) => {
            if (node.type.name === "heading") {
              return ""; // hardcoded in the css
            }

            return ""; // hardcoded in the css
          },
        }),
        TaskList.configure({
          HTMLAttributes: {
            class: "task-list-extension",
          },
        }),
        TaskItem.configure({
          HTMLAttributes: {
            class: "task-item-extension",
          },
        }),
        // register the ydoc with Tiptap
        Collaboration.configure({
          document: props.yDocRef.current,
          field: "page",
        }),
        AwarnessExtension.configure({
          awareness: props.yAwarenessRef.current,
        }),
        SerenityScrollIntoViewForEditModeExtension.configure({}),
        FileNodeExtension.configure({
          encryptAndUploadFile: props.encryptAndUploadFile,
          downloadAndDecryptFile: props.downloadAndDecryptFile,
          shareOrSaveFile: props.shareOrSaveFile,
        }),
        CommentsExtension.configure({
          comments: props.comments,
          yDoc: props.yDocRef.current,
          highlightComment: props.highlightComment,
          highlightedCommentId: props.highlightedCommentId,
        }),
        Table.configure({
          HTMLAttributes: {
            class: "table-extension",
          },
        }),
        TableRow,
        TableHeader,
        TableCell,
      ],
      onCreate: (params) => {
        if (isNew) {
          const json = params.editor.getJSON();
          if (json.content?.length === 1) {
            params.editor.chain().toggleHeading({ level: 1 }).focus().run();
          }
        }
        if (props.onCreate) {
          props.onCreate(params);
        }
      },
      onUpdate: (params) => {
        if (isNew) {
          // sets the title based on the first line exactly once
          const json = params.editor.getJSON();
          if (json.content?.length === 1) {
            if (json.content[0].content?.length === 1) {
              newTitleRef.current = json.content[0].content[0].text || "";
            }
          } else if (shouldCommitNewTitleRef.current) {
            shouldCommitNewTitleRef.current = false;
            props.updateTitle(newTitleRef.current);
          }
        }
        // makes sure the editor is scrolled up when the user jumps to
        // the next line (return or long line) while editing
        // unfortionatly only works when triggered with a timeout of 0 or more
        setTimeout(() => {
          params.editor.chain().scrollIntoViewWhileEditMode().run();
        }, 0);
      },
      onTransaction: (transactionParams) => {
        if (props.onTransaction) {
          props.onTransaction(transactionParams);
        }
      },
      onFocus: (params) => {
        if (props.onFocus) {
          props.onFocus(params);
        }
        // timeout to make sure the selection has time to be set
        // before we scroll into view
        setTimeout(() => {
          params.editor.chain().scrollIntoViewOnEditMode().run();
        }, scrollIntoViewOnEditModeDelay);
      },
      onBlur: (params) => {
        if (props.onBlur) {
          props.onBlur(params);
        }
      },
    },
    [props.documentId]
  );

  useEffect(() => {
    if (editor) {
      editor.storage.comments.comments = props.comments;
      editor.storage.comments.highlightedCommentId = props.highlightedCommentId;
      // empty transaction to make sure the comments are updated
      editor.view.dispatch(editor.view.state.tr);
    }
  }, [props.comments, props.highlightedCommentId, editor]);

  return (
    <div className="flex h-full flex-auto flex-row">
      {/* z-index needed so BubbleMenu overlaps with Sidebar */}
      <View style={tw`flex-auto text-gray-900 dark:text-white z-10`}>
        <div className="flex-auto overflow-y-auto overflow-x-hidden">
          <EditorContent
            style={{
              // needed to expand the editor into the unsafe area
              // on iOS native App in case the client is not in edit mode
              // to make sure the content expands till the bottom
              height: "-webkit-fill-available",
            }}
            editor={editor}
            className={
              hasEditorSidebar ? "has-editor-sidebar" : "has-editor-bottombar"
            }
          />
        </div>
      </View>
      {hasEditorSidebar && editor && (
        // the ScrollView should be part of the EditorSidebar, but there is a wierd bug
        // where react crashes when view is resized in the Web client from desktop to mobile
        // or the other way around
        //
        // grow-0 overrides default of ScrollView to keep the assigned width
        <ScrollView
          style={tw`w-sidebar grow-0 border-l border-gray-200 bg-gray-100`}
        >
          <EditorSidebar
            editor={editor}
            headingLevels={headingLevels}
            encryptAndUploadFile={props.encryptAndUploadFile}
          />

          <BubbleMenu
            editor={editor}
            tippyOptions={{ duration: 100 }}
            // modified default from https://github.com/ueberdosis/tiptap/blob/main/packages/extension-bubble-menu/src/bubble-menu-plugin.ts#L47-L79
            shouldShow={({ state, from, to, view, editor }) => {
              const { doc, selection } = state;
              const { empty } = selection;

              // Sometime check for `empty` is not enough.
              // Doubleclick an empty paragraph returns a node size of 2.
              // So we check also for an empty text size.
              const isEmptyTextBlock =
                !doc.textBetween(from, to).length &&
                isTextSelection(state.selection);

              // When clicking on a element inside the bubble menu the editor "blur" event
              // is called and the bubble menu item is focussed. In this case we should
              // consider the menu as part of the editor and keep showing the menu
              let isChildOfMenu = false;
              if (bubbleMenuRef.current) {
                isChildOfMenu = bubbleMenuRef.current.contains(
                  document.activeElement
                );
              }

              const hasEditorFocus = view.hasFocus() || isChildOfMenu;

              if (
                !hasEditorFocus ||
                empty ||
                isEmptyTextBlock ||
                !editor.isEditable ||
                editor.isActive("file")
              ) {
                return false;
              }

              return true;
            }}
          >
            <BoxShadow elevation={3} rounded ref={bubbleMenuRef}>
              <HStack
                space={1}
                style={tw`p-1 bg-white border border-gray-200 rounded`}
                alignItems="center"
              >
                <ToggleButton
                  onPress={() => editor.chain().focus().toggleBold().run()}
                  name="bold"
                  isActive={editor.isActive("bold")}
                />

                <ToggleButton
                  onPress={() => editor.chain().focus().toggleItalic().run()}
                  name="italic"
                  isActive={editor.isActive("italic")}
                />

                <ToggleButton
                  onPress={() => editor.chain().focus().toggleCode().run()}
                  name="code-view"
                  isActive={editor.isActive("code")}
                />

                <EditorBottombarDivider />

                <ToggleButton
                  onPress={() =>
                    editor.chain().focus().toggleLink({ href: "#" }).run()
                  }
                  name="link"
                  isActive={editor.isActive("link")}
                />

                <EditorBottombarDivider />

                <ToggleButton
                  onPress={() => {
                    setHasCreateCommentBubble(true);
                  }}
                  name="chat-1-line"
                  isActive={false}
                />
              </HStack>

              {hasCreateCommentBubble && (
                <VStack style={tw`w-80 bg-white rounded`}>
                  <RawInput
                    placeholder="Add a comment"
                    value={commentText}
                    onChangeText={(text) => setCommentText(text)}
                    variant={"unstyled"}
                    multiline
                    style={tw`p-3`}
                    _stack={{
                      height: 60,
                    }}
                  />
                  <HStack
                    style={tw`p-3 border-t border-solid border-gray-200`}
                    alignItems="center"
                    justifyContent="flex-end"
                  >
                    <SubmitButton
                      onPress={() => {
                        const ystate = ySyncPluginKey.getState(editor.state);
                        const { type, binding } = ystate;

                        props.createComment({
                          text: commentText,
                          from: absolutePositionToRelativePosition(
                            editor.view.state.selection.from,
                            type,
                            binding.mapping
                          ),
                          to: absolutePositionToRelativePosition(
                            editor.view.state.selection.to,
                            type,
                            binding.mapping
                          ),
                        });
                      }}
                    />
                  </HStack>
                </VStack>
              )}
            </BoxShadow>
          </BubbleMenu>
        </ScrollView>
      )}
    </div>
  );
};
