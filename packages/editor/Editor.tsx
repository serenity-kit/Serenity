import "./editor-output.css";
import "./awareness.css";
import React from "react";
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

type EditorProps = {
  documentId: string;
  yDocRef: React.MutableRefObject<Y.Doc>;
  yAwarenessRef?: React.MutableRefObject<Awareness>;
  autofocus?: boolean;
  openDrawer: () => void;
};

const headingLevels: Level[] = [1, 2, 3];

export const Editor = (props: EditorProps) => {
  const autofocus = props.autofocus ?? false;
  const hasEditorSidebar = useHasEditorSidebar();

  const editor = useEditor(
    {
      autofocus,
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
          placeholder: "Just start writing here …",
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
          awareness: props.yAwarenessRef?.current,
        }),
      ],
    },
    [props.documentId]
  );

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
