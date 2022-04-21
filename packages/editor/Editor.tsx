import "./editor-output.css";
import "./awareness.css";
import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { CenterHeader, Text, tw, View } from "@serenity-tools/ui";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Level } from "@tiptap/extension-heading";
import Collaboration from "@tiptap/extension-collaboration";
import * as Y from "yjs";
import { Awareness } from "y-protocols/awareness";
import { AwarnessExtension } from "./naisho-awareness-extension";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import EditorSidebar from "./components/editorSidebar/EditorSidebar";
import { useHasEditorSidebar } from "./hooks/useHasEditorSidebar";

type EditorProps = {
  yDocRef: React.MutableRefObject<Y.Doc>;
  yAwarenessRef?: React.MutableRefObject<Awareness>;
  openDrawer: () => void;
};

const headingLevels: Level[] = [1, 2, 3];

export const Editor = (props: EditorProps) => {
  const hasEditorSidebar = useHasEditorSidebar();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // the Collaboration extension comes with its own history handling
        history: false,
        code: {
          HTMLAttributes: {
            // using py-0.5 so that code elements in adjacent lines don't overlap
            class: "py-0.5 px-1.5 bg-gray-200 rounded",
          },
        },
        codeBlock: {
          HTMLAttributes: {
            class: "my-4 p-4 bg-gray-100 rounded",
          },
        },
        heading: {
          levels: headingLevels,
        },
      }),
      Link.configure({
        openOnClick: false,
      }),
      TaskList,
      TaskItem,
      // register the ydoc with Tiptap
      Collaboration.configure({
        document: props.yDocRef.current,
        field: "page",
      }),
      AwarnessExtension.configure({ awareness: props.yAwarenessRef?.current }),
    ],
  });

  return (
    <div className="flex flex-auto flex-row">
      <View style={tw`flex-auto text-gray-900 dark:text-white`}>
        <CenterHeader openDrawer={props.openDrawer}>
          <Text>Page</Text>
        </CenterHeader>
        <div className="flex-auto overflow-y-auto overflow-x-hidden px-4 py-10 xs:px-6 sm:px-10 md:py-14 lg:px-16">
          <EditorContent editor={editor} />
        </div>
      </View>
      {hasEditorSidebar && (
        <EditorSidebar editor={editor} headingLevels={headingLevels} />
      )}
    </div>
  );
};
