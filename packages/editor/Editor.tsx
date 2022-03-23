import "./editor-output.css";
import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { EditorWrapperView, View } from "@serenity-tools/ui";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import * as Y from "yjs";

type EditorProps = {
  ydoc: Y.Doc;
};

export const Editor = (props: EditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // the Collaboration extension comes with its own history handling
        history: false,
      }),
      // register the document with Tiptap
      Collaboration.configure({
        document: props.ydoc,
      }),
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
