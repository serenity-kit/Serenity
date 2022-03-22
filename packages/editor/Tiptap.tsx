// import "./editor-output.css";
import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { EditorWrapperView, View } from "@serenity-tools/ui";
import StarterKit from "@tiptap/starter-kit";

export const Tiptap = () => {
  const editor = useEditor({
    extensions: [StarterKit],
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
