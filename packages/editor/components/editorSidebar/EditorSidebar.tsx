import React from "react";
import { EditorSidebarIcon, SidebarButton, tw, View } from "@serenity-tools/ui";
import { Editor } from "@tiptap/react";
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
    <View style={tw`w-60 h-full border-l border-gray-200 bg-gray-100`}>
      <div>
        {headingLevels.map((lvl) => {
          return (
            <SidebarButton
              key={lvl}
              onPress={() =>
                editor?.chain().focus().toggleHeading({ level: lvl }).run()
              }
            >
              <EditorSidebarIcon
                isActive={editor?.isActive("heading", { level: lvl }) || false}
                name="heading"
              />
              Headline {lvl}
            </SidebarButton>
          );
        })}
        <SidebarButton
          onPress={() => editor?.chain().focus().toggleBold().run()}
        >
          <EditorSidebarIcon
            isActive={editor?.isActive("bold") || false}
            name="bold"
          />
          Bold
        </SidebarButton>

        <SidebarButton
          onPress={() => editor?.chain().focus().toggleItalic().run()}
        >
          <EditorSidebarIcon
            isActive={editor?.isActive("italic") || false}
            name="italic"
          />
          Italic
        </SidebarButton>

        {/* styling dummy */}
        <SidebarButton
          onPress={() =>
            editor?.chain().focus().toggleLink({ href: "#" }).run()
          }
        >
          <EditorSidebarIcon
            isActive={editor?.isActive("link") || false}
            name="link"
          />
          Link
        </SidebarButton>

        <SidebarButton
          onPress={() => editor?.chain().focus().toggleCode().run()}
        >
          <EditorSidebarIcon
            isActive={editor?.isActive("code") || false}
            name="code-view"
          />
          Code
        </SidebarButton>

        <SidebarButton
          onPress={() => editor?.chain().focus().toggleCodeBlock().run()}
        >
          <EditorSidebarIcon
            isActive={editor?.isActive("codeBlock") || false}
            name="code-s-slash-line"
          />
          Codeblock
        </SidebarButton>

        <SidebarButton
          onPress={() => editor?.chain().focus().toggleBlockquote().run()}
        >
          <EditorSidebarIcon
            isActive={editor?.isActive("blockquote") || false}
            name="question-mark"
          />
          Blockquote
        </SidebarButton>

        <SidebarButton
          onPress={() => editor?.chain().focus().toggleBulletList().run()}
        >
          <EditorSidebarIcon
            isActive={editor?.isActive("bulletList") || false}
            name="list-unordered"
          />
          Bullet-List
        </SidebarButton>

        <SidebarButton
          onPress={() => editor?.chain().focus().toggleOrderedList().run()}
        >
          <EditorSidebarIcon
            isActive={editor?.isActive("orderedList") || false}
            name="list-ordered"
          />
          Numbered List
        </SidebarButton>

        <SidebarButton
          onPress={() => editor?.chain().focus().toggleTaskList().run()}
        >
          <EditorSidebarIcon
            isActive={editor?.isActive("taskList") || false}
            name="list-check-2"
          />
          Checklist
        </SidebarButton>
      </div>
    </View>
  );
}
