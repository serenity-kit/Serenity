import {
  BubbleMenuContentWrapper,
  Button,
  EditorContentButton,
  RawInput,
  ScrollView,
  SubmitButton,
  TextArea,
  ToggleButton,
  Tooltip,
  VerticalDivider,
  View,
  tw,
  useHasEditorSidebar,
} from "@serenity-tools/ui";
import { EditorEvents, isTextSelection } from "@tiptap/core";
import Collaboration from "@tiptap/extension-collaboration";
import { Level } from "@tiptap/extension-heading";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TableRow from "@tiptap/extension-table-row";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import { BubbleMenu, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { HStack } from "native-base";
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
import EditorSidebar from "./components/editorSidebar/EditorSidebar";
import "./editor-output.css";
import { CommentsExtension } from "./extensions/commentsExtension/commentsExtension";
import { findCommentForPos } from "./extensions/commentsExtension/findCommentForPos";
import { updateCommentsDataAndScrollToHighlighted } from "./extensions/commentsExtension/updateCommentsDataAndScrollToHighlighted";
import { SerenityScrollIntoViewForEditModeExtension } from "./extensions/scrollIntoViewForEditModeExtensions/scrollIntoViewForEditModeExtensions";
import { SearchExtension } from "./extensions/searchExtension/searchExtension";
import { YAwarenessExtension } from "./extensions/secSyncAwarenessExtension/secSyncAwarenessExtension";
import { TableCellExtension } from "./extensions/tableCellExtension/tableCellExtension";
import { isCellSelection } from "./extensions/tableExtension/isCellSelection";
import { TableExtension } from "./extensions/tableExtension/tableExtension";
import { TableHeaderExtension } from "./extensions/tableHeaderExtension/tableHeaderExtension";
import { EditorComment } from "./types";

type HighlightedCommentSource = "editor" | "sidebar";

type HighlightedComment = { id: string; source: HighlightedCommentSource };

type DocumentState = "active" | "loading" | "error";

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
  highlightComment: (commentId: string | null, openSidebar: boolean) => void;
  highlightedComment: HighlightedComment | null;
  hasOpenCommentsSidebar: () => boolean;
  editable: boolean;
  documentState: DocumentState;
  workspaceDevicesToUsernames: Record<string, string>;
  canComment: boolean;
};

const headingLevels: Level[] = [1, 2, 3];

export const Editor = (props: EditorProps) => {
  const hasEditorSidebar = useHasEditorSidebar();
  // using the state here since it's only true on the first render
  const [isNew] = useState(props.isNew ?? false);
  const [hasCreateCommentBubble, setHasCreateCommentBubble] = useState(false);
  const [commentText, setCommentText] = useState("");

  const [hasLinkBubble, setHasLinkBubble] = useState(false);
  const [linkHref, setLinkHref] = useState("");

  const [selectionType, setSelectionType] = useState<null | string>(null);

  const newTitleRef = useRef("");
  const shouldCommitNewTitleRef = useRef(isNew);
  const scrollIntoViewOnEditModeDelay =
    props.scrollIntoViewOnEditModeDelay ?? 150; // 150ms works well on iOS Safari
  const bubbleMenuRef = useRef<HTMLDivElement>(null);
  const canComment = props.canComment;

  // needed since the YAwarenessExtension.render function doesn't get updated on every
  // render of the current React component
  const workspaceDevicesToUsernamesRef = useRef(
    props.workspaceDevicesToUsernames
  );
  useEffect(() => {
    workspaceDevicesToUsernamesRef.current = props.workspaceDevicesToUsernames;
  });

  const editor = useEditor(
    {
      editable: props.editable,
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
          // necessary for the autolinker and when pasting content
          validate: (href) => /^https?:\/\//.test(href),
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
        YAwarenessExtension.configure({
          awareness: props.yAwarenessRef.current,
          render: (user) => {
            // using a ref since the YAwarenessExtension.render function doesn't get updated
            // on every render of the current React component
            const username =
              workspaceDevicesToUsernamesRef.current[user.publicKey] ||
              "Unknown";
            const cursor = document.createElement("span");
            if (username) {
              cursor.style.setProperty("--collab-color", "#444");
              cursor.classList.add("collaboration-cursor__caret");

              const label = document.createElement("div");
              label.classList.add("collaboration-cursor__label");

              label.insertBefore(document.createTextNode(username), null);
              cursor.insertBefore(label, null);
            }
            return cursor;
          },
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
          highlightedComment: props.highlightedComment,
        }),
        TableExtension.configure({
          HTMLAttributes: {
            class: "table-extension",
          },
        }),
        TableRow,
        TableHeaderExtension,
        TableCellExtension,
        SearchExtension,
      ],
      onCreate: (params) => {
        if (isNew) {
          params.editor.chain().focus().run();
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
        // unfortunately only works when triggered with a timeout of 0 or more
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
      onSelectionUpdate: (params) => {
        const selection = params.editor.view.state.selection;

        if (selection && isCellSelection(selection)) {
          if (selection.isRowSelection() && selection.isColSelection()) {
            setSelectionType("table");
          } else if (selection.isRowSelection()) {
            setSelectionType("row");
          } else if (selection.isColSelection()) {
            setSelectionType("column");
          }
        } else {
          setSelectionType(null);
        }
      },
    },
    [props.documentId]
  );

  useEffect(() => {
    if (editor) {
      updateCommentsDataAndScrollToHighlighted(
        editor,
        props.comments,
        props.highlightedComment
      );
    }
  }, [props.comments, props.highlightedComment, editor]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(props.editable);
    }
  }, [props.editable, editor]);

  return (
    <div className="flex h-full flex-auto flex-row">
      {/* z-index needed so BubbleMenu overlaps with Sidebar */}
      <View
        id="editor-print-wrapper"
        style={tw`flex-auto text-gray-900 dark:text-white z-10`}
      >
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
        // shrink-0 needed so Editor doesn't squish the Sidebar and it keeps the fixed width
        <ScrollView
          style={tw`w-sidebar grow-0 shrink-0 border-l border-gray-200 bg-gray-100`}
        >
          <EditorSidebar
            editor={editor}
            headingLevels={headingLevels}
            encryptAndUploadFile={props.encryptAndUploadFile}
            documentState={props.documentState}
            editable={props.editable}
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
                editor.isActive("file") ||
                isCellSelection(state.selection)
              ) {
                // hide the create comment & link bubble and clear the text when the bubble menu is blurred
                setCommentText("");
                setHasCreateCommentBubble(false);
                setLinkHref("");
                setHasLinkBubble(false);
                return false;
              }

              return true;
            }}
          >
            <BubbleMenuContentWrapper
              ref={bubbleMenuRef}
              vertical={hasCreateCommentBubble || hasLinkBubble}
              style={hasCreateCommentBubble || hasLinkBubble ? tw`w-80` : tw``}
            >
              {hasLinkBubble ? (
                <>
                  <HStack style={tw`p-2 bg-white`}>
                    <View style={tw`flex-grow`}>
                      <RawInput
                        variant={"unstyled"}
                        placeholder="https://"
                        value={linkHref}
                        autoFocus
                        onChangeText={(text) => setLinkHref(text)}
                        style={tw`mr-2`}
                      />
                    </View>
                    <Button
                      onPress={() => {
                        setLinkHref("");
                        setHasLinkBubble(false);
                        editor.commands.setLink({
                          href: linkHref,
                          target: "_blank",
                        });
                      }}
                      disabled={
                        // don't even allow to save a link not starting with https://
                        linkHref === "" || !linkHref.startsWith("https://")
                      }
                      testID="bubble-menu__save-comment-button"
                    >
                      Save
                    </Button>
                  </HStack>
                </>
              ) : hasCreateCommentBubble ? (
                <>
                  <TextArea
                    placeholder="Add a comment"
                    variant={"unstyled"}
                    value={commentText}
                    autoFocus
                    onChangeText={(text) => setCommentText(text)}
                    testID="bubble-menu__create-comment-input"
                    maxRows={3}
                    maxLength={500}
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
                        setCommentText("");
                        setHasCreateCommentBubble(false);
                        editor.chain().focus().run();
                      }}
                      disabled={commentText === ""}
                      testID="bubble-menu__save-comment-button"
                    />
                  </HStack>
                </>
              ) : (
                <>
                  <Tooltip label={"Bold"} placement={"top"} hasArrow={false}>
                    <ToggleButton
                      onPress={() => editor.chain().focus().toggleBold().run()}
                      name="bold"
                      isActive={editor.isActive("bold")}
                    />
                  </Tooltip>

                  <Tooltip label={"Italic"} placement={"top"} hasArrow={false}>
                    <ToggleButton
                      onPress={() =>
                        editor.chain().focus().toggleItalic().run()
                      }
                      name="italic"
                      isActive={editor.isActive("italic")}
                    />
                  </Tooltip>

                  <Tooltip label={"Code"} placement={"top"} hasArrow={false}>
                    <ToggleButton
                      onPress={() => editor.chain().focus().toggleCode().run()}
                      name="code-view"
                      isActive={editor.isActive("code")}
                    />
                  </Tooltip>

                  <VerticalDivider />

                  <Tooltip label={"Link"} placement={"top"} hasArrow={false}>
                    <ToggleButton
                      onPress={() => {
                        if (editor.isActive("link")) {
                          editor.commands.unsetLink();
                        } else {
                          setHasLinkBubble(true);
                        }
                      }}
                      name="link"
                      isActive={editor.isActive("link")}
                    />
                  </Tooltip>

                  <VerticalDivider />

                  {canComment && (
                    <Tooltip
                      label={"Add comment"}
                      placement={"top"}
                      hasArrow={false}
                    >
                      <ToggleButton
                        onPress={() => {
                          setHasCreateCommentBubble(true);
                        }}
                        name="chat-4-line"
                        isActive={false}
                        testID="bubble-menu__initiate-comment-button"
                      />
                    </Tooltip>
                  )}
                </>
              )}
            </BubbleMenuContentWrapper>
          </BubbleMenu>

          {/* Table menu */}
          <BubbleMenu
            editor={editor}
            tippyOptions={{ duration: 100, placement: "bottom" }}
            shouldShow={({ state, from, to, view, editor }) => {
              const { doc, selection } = state;
              const { empty } = selection;

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
              const isColSelection =
                isCellSelection(selection) && selection.isColSelection();
              const isRowSelection =
                isCellSelection(selection) && selection.isRowSelection();

              if (
                !hasEditorFocus ||
                empty ||
                !isCellSelection(state.selection) ||
                // check if neither row or col-selection, as otherwise will also show on random cell-selection
                (!isRowSelection && !isColSelection) ||
                !editor.isEditable
              ) {
                return false;
              }

              return true;
            }}
          >
            <BubbleMenuContentWrapper padded={false}>
              <Tooltip
                label={`Delete ${selectionType}`}
                placement={"top"}
                hasArrow={false}
              >
                <ToggleButton
                  onPress={() => {
                    if (selectionType === "table") {
                      editor.chain().focus().deleteTable().run();
                    } else if (selectionType === "row") {
                      editor.chain().focus().deleteRow().run();
                    } else if (selectionType === "column") {
                      editor.chain().focus().deleteColumn().run();
                    }
                  }}
                  name="delete-bin-line"
                  isActive={false}
                />
              </Tooltip>
            </BubbleMenuContentWrapper>
          </BubbleMenu>

          {/* View Comment menu */}
          <BubbleMenu
            editor={editor}
            tippyOptions={{ duration: 100, placement: "bottom" }}
            // modified default from https://github.com/ueberdosis/tiptap/blob/main/packages/extension-bubble-menu/src/bubble-menu-plugin.ts#L47-L79
            shouldShow={({ state, from, to, view, editor }) => {
              if (from !== to || props.hasOpenCommentsSidebar()) {
                return false;
              }
              const comment = findCommentForPos({ editor, pos: from });

              if (comment) {
                return true;
              }
              return false;
            }}
          >
            <BubbleMenuContentWrapper padded={false}>
              <EditorContentButton
                iconName="chat-4-fill"
                onPress={() => {
                  const comment = findCommentForPos({
                    editor,
                    pos: editor.state.selection.from,
                  });
                  if (comment) {
                    props.highlightComment(comment.id, true);
                  }
                }}
              >
                View Comment
              </EditorContentButton>
            </BubbleMenuContentWrapper>
          </BubbleMenu>
        </ScrollView>
      )}
    </div>
  );
};
