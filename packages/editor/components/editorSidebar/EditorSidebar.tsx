import React from "react";
import { SidebarButton, tw, View } from "@serenity-tools/ui";
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
            <SidebarButton
              key={lvl}
              onPress={() =>
                editor?.chain().focus().toggleHeading({ level: lvl }).run()
              }
            >
              <EditorButton
                isActive={editor?.isActive("heading", { level: lvl }) || false}
              >
                H{lvl}
              </EditorButton>
              Headline {lvl}
            </SidebarButton>
          );
        })}
        <SidebarButton
          onPress={() => editor?.chain().focus().toggleBold().run()}
        >
          <EditorButton
            onClick={() => undefined}
            isActive={editor?.isActive("bold") || false}
          >
            B
          </EditorButton>
          Bold
        </SidebarButton>

        <SidebarButton
          onPress={() => editor?.chain().focus().toggleItalic().run()}
        >
          <EditorButton isActive={editor?.isActive("italic") || false}>
            I
          </EditorButton>
          Italic
        </SidebarButton>

        {/* styling dummy */}
        <SidebarButton
          onPress={() =>
            editor?.chain().focus().toggleLink({ href: "#" }).run()
          }
        >
          <EditorButton isActive={editor?.isActive("link") || false}>
            L
          </EditorButton>
          Link
        </SidebarButton>

        <SidebarButton
          onPress={() => editor?.chain().focus().toggleCode().run()}
        >
          <EditorButton isActive={editor?.isActive("code") || false}>
            C
          </EditorButton>
          Code
        </SidebarButton>

        <SidebarButton
          onPress={() => editor?.chain().focus().toggleCodeBlock().run()}
        >
          <EditorButton isActive={editor?.isActive("codeBlock") || false}>
            K
          </EditorButton>
          Codeblock
        </SidebarButton>

        <SidebarButton
          onPress={() => editor?.chain().focus().toggleBlockquote().run()}
        >
          <EditorButton isActive={editor?.isActive("blockquote") || false}>
            Q
          </EditorButton>
          Blockquote
        </SidebarButton>

        <SidebarButton
          onPress={() => editor?.chain().focus().toggleBulletList().run()}
        >
          <EditorButton isActive={editor?.isActive("bulletList") || false}>
            &sdot;
          </EditorButton>
          Bullet-List
        </SidebarButton>

        <SidebarButton
          onPress={() => editor?.chain().focus().toggleOrderedList().run()}
        >
          <EditorButton isActive={editor?.isActive("orderedList") || false}>
            1
          </EditorButton>
          Numbered List
        </SidebarButton>

        <SidebarButton
          onPress={() => editor?.chain().focus().toggleTaskList().run()}
        >
          <EditorButton isActive={editor?.isActive("taskList") || false}>
            T
          </EditorButton>
          Checklist
        </SidebarButton>
      </div>
    </View>
  );
}
