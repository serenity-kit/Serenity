import React from "react";
import { tw, View } from "@serenity-tools/ui";
import { Editor } from "@tiptap/react";
import EditorButton from "../editorButton/EditorButton";
import { Level } from "@tiptap/extension-heading";

type EditorSidebarProps = {
  editor: Editor | null;
  headingLevels: Level[];
};

export default function EditorSidebar({
  editor,
  headingLevels,
}: EditorSidebarProps) {
  return (
    <View style={tw`w-60 h-full border-l border-gray-200`}>
      <div>
        {headingLevels.map((lvl) => {
          return (
            <EditorButton
              key={lvl}
              onClick={() =>
                editor?.chain().focus().toggleHeading({ level: lvl }).run()
              }
              isActive={editor?.isActive("heading", { level: lvl }) || false}
            >
              H{lvl}
            </EditorButton>
          );
        })}
        <EditorButton
          onClick={() => editor?.chain().focus().toggleBold().run()}
          isActive={editor?.isActive("bold") || false}
        >
          B
        </EditorButton>
        <EditorButton
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          isActive={editor?.isActive("italic") || false}
        >
          I
        </EditorButton>
        {/* styling dummy */}
        <EditorButton
          onClick={() =>
            editor?.chain().focus().toggleLink({ href: "#" }).run()
          }
          isActive={editor?.isActive("link") || false}
        >
          L
        </EditorButton>
        <EditorButton
          onClick={() => editor?.chain().focus().toggleCode().run()}
          isActive={editor?.isActive("code") || false}
        >
          C
        </EditorButton>
        <EditorButton
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
          isActive={editor?.isActive("codeBlock") || false}
        >
          K
        </EditorButton>
        <EditorButton
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          isActive={editor?.isActive("blockquote") || false}
        >
          Q
        </EditorButton>
        <EditorButton
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          isActive={editor?.isActive("bulletList") || false}
        >
          &sdot;
        </EditorButton>
        <EditorButton
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          isActive={editor?.isActive("orderedList") || false}
        >
          1
        </EditorButton>
        <EditorButton
          onClick={() => editor?.chain().focus().toggleTaskList().run()}
          isActive={editor?.isActive("taskList") || false}
        >
          T
        </EditorButton>
      </div>
    </View>
  );
}
