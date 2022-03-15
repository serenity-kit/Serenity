import { useEditor, EditorContent } from "@tiptap/react";
import { EditorWrapperView } from "@serenity-tools/ui";
import StarterKit from "@tiptap/starter-kit";

export const Tiptap = () => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p>EDITOR content!</p>",
  });

  return (
    <EditorWrapperView>
      <div>
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          style={{ color: editor?.isActive("bold") ? "black" : "#ccc" }}
        >
          Bold
        </button>
      </div>
      <EditorContent editor={editor} />
    </EditorWrapperView>
  );
};
