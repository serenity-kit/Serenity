import {
  BoxShadow,
  EditorBottombarButton,
  EditorBottombarDivider,
  tw,
  useHasEditorSidebar,
  View,
} from "@serenity-tools/ui";
import { EditorEvents } from "@tiptap/core";
import Collaboration from "@tiptap/extension-collaboration";
import { Level } from "@tiptap/extension-heading";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import { BubbleMenu, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { HStack } from "native-base";
import React, { useRef, useState } from "react";
import { Awareness } from "y-protocols/awareness";
import * as Y from "yjs";
import {
  DownloadAndDecryptFileFunction,
  EncryptAndUploadFunctionFile,
  FileNodeExtension,
} from "../editor-file-extension/src";
import "./awareness.css";
import EditorSidebar from "./components/editorSidebar/EditorSidebar";
import "./editor-output.css";
import { AwarnessExtension } from "./naisho-awareness-extension";
import { SerenityScrollIntoViewOnEditModeExtension } from "./scroll-into-view-on-edit-mode-extensions";

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
};

const headingLevels: Level[] = [1, 2, 3];

export const Editor = (props: EditorProps) => {
  const hasEditorSidebar = useHasEditorSidebar();
  // using the state here since it's only true on the first render
  const [isNew] = useState(props.isNew ?? false);
  const newTitleRef = useRef("");
  const shouldCommitNewTitleRef = useRef(isNew);
  const scrollIntoViewOnEditModeDelay =
    props.scrollIntoViewOnEditModeDelay ?? 150; // 150ms works well on iOS Safari

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
        SerenityScrollIntoViewOnEditModeExtension.configure({}),
        FileNodeExtension.configure({
          encryptAndUploadFile: props.encryptAndUploadFile,
          downloadAndDecryptFile: props.downloadAndDecryptFile,
        }),
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

  return (
    <div className="flex flex-auto flex-row">
      <View style={tw`flex-auto text-gray-900 dark:text-white`}>
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
      {hasEditorSidebar && (
        <EditorSidebar
          editor={editor}
          headingLevels={headingLevels}
          encryptAndUploadFile={props.encryptAndUploadFile}
        />
      )}
      {hasEditorSidebar && editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <BoxShadow elevation={3} rounded>
            <HStack
              space={1}
              style={tw`p-1 bg-white border border-gray-200 rounded`}
              alignItems="center"
            >
              <EditorBottombarButton
                onPress={() => editor.chain().focus().toggleBold().run()}
                name="bold"
                isActive={editor.isActive("bold")}
              />

              <EditorBottombarButton
                onPress={() => editor.chain().focus().toggleItalic().run()}
                name="italic"
                isActive={editor.isActive("italic")}
              />

              <EditorBottombarButton
                onPress={() => editor.chain().focus().toggleCode().run()}
                name="code-view"
                isActive={editor.isActive("code")}
              />

              {/* for some reason tailwind md:h-6 doesn't work on the Divider yet */}
              <EditorBottombarDivider style={tw`h-6`} />

              <EditorBottombarButton
                onPress={() =>
                  editor.chain().focus().toggleLink({ href: "#" }).run()
                }
                name="link"
                isActive={editor.isActive("link")}
              />
            </HStack>
          </BoxShadow>
        </BubbleMenu>
      )}
    </div>
  );
};
