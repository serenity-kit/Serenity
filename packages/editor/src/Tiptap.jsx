import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export const Tiptap = () => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p>EDITOR content!</p>",
  });

  console.log(editor);

  return (
    <div>
      <div>
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          style={{ color: editor?.isActive("bold") ? "black" : "#ccc" }}
        >
          Bold
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};
