import "./editor-output.css";
import "./awareness.css";
import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { EditorWrapperView, View } from "@serenity-tools/ui";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import * as Y from "yjs";
import { Awareness } from "y-protocols/awareness";
import { AwarnessExtension } from "./naisho-awareness-extension";

type EditorProps = {
  ydoc: Y.Doc;
  yAwareness?: Awareness;
};

export const Editor = (props: EditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // the Collaboration extension comes with its own history handling
        history: false,
      }),
      // register the ydoc with Tiptap
      Collaboration.configure({
        document: props.ydoc,
        field: "page",
      }),
      AwarnessExtension.configure({ awareness: props.yAwareness }),
    ],
  });

  return (
    <EditorWrapperView>
      <View>
        <button
          onClick={() => editor?.chain().focus().toggleBold().run()}
          style={{ color: editor?.isActive("bold") ? "black" : "#ccc" }}
        >
          Bold
        </button>
      </View>
      <div className="prose">
        <EditorContent editor={editor} />
      </div>
    </EditorWrapperView>
  );
};
