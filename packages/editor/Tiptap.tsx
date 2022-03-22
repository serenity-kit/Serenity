import "./editor-output.css";
import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { EditorWrapperView, View } from "@serenity-tools/ui";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import * as Y from "yjs";

const ydoc = new Y.Doc();

export const Tiptap = () => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // The Collaboration extension comes with its own history handling
        history: false,
      }),
      // Register the document with Tiptap
      Collaboration.configure({
        document: ydoc,
      }),
    ],
    content: "<p>EDITOR content!</p>",
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
