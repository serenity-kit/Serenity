import "./editor-output.css";
import "./awareness.css";
import React, { useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { tw, View } from "@serenity-tools/ui";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Level } from "@tiptap/extension-heading";
import Collaboration from "@tiptap/extension-collaboration";
import * as Y from "yjs";
import { Awareness } from "y-protocols/awareness";
import { AwarnessExtension } from "./naisho-awareness-extension";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Placeholder from "@tiptap/extension-placeholder";
import EditorSidebar from "./components/editorSidebar/EditorSidebar";
import { useHasEditorSidebar } from "./hooks/useHasEditorSidebar";
import { EditorEvents } from "@tiptap/core";

type EditorProps = {
  documentId: string;
  yDocRef: React.MutableRefObject<Y.Doc>;
  yAwarenessRef: React.MutableRefObject<Awareness>;
  isNew?: boolean;
  openDrawer: () => void;
  updateTitle: (title: string) => void;
  onTransaction?: (params: EditorEvents["transaction"]) => void;
};

const headingLevels: Level[] = [1, 2, 3];

export const Editor = (props: EditorProps) => {
  const hasEditorSidebar = useHasEditorSidebar();
  // using the state here since it's only true on the first render
  const [isNew] = useState(props.isNew ?? false);
  const newTitleRef = useRef("");
  const shouldCommitNewTitleRef = useRef(isNew);

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
      ],
      onCreate: (params) => {
        if (isNew) {
          const json = params.editor.getJSON();
          if (json.content?.length === 1) {
            params.editor.chain().toggleHeading({ level: 1 }).focus().run();
          }
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
    },
    [props.documentId]
  );
  window.editor = editor;

  return (
    <div className="flex flex-auto flex-row">
      <View style={tw`flex-auto text-gray-900 dark:text-white`}>
        <div className="flex-auto overflow-y-auto overflow-x-hidden">
          {/* h-full needed to expand the editor to it's full height even when empty */}
          <EditorContent className="h-full" editor={editor} />
        </div>
      </View>
      {hasEditorSidebar && (
        <EditorSidebar editor={editor} headingLevels={headingLevels} />
      )}
    </div>
  );
};
