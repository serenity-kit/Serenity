import {
  EncryptAndUploadFunctionFile,
  initiateImagePicker,
  InsertImageParams,
  insertImages,
  updateImageAttributes,
  UpdateImageAttributesParams,
} from "@serenity-tools/editor-image-extension";
import {
  EditorSidebarIcon,
  Heading,
  SidebarButton,
  SidebarDivider,
  Text,
  tw,
  View,
} from "@serenity-tools/ui";
import { Level } from "@tiptap/extension-heading";
import { Editor } from "@tiptap/react";
import React, { useRef } from "react";
import { Platform } from "react-native";

type EditorSidebarProps = {
  editor: Editor | null;
  headingLevels: Level[];
  encryptAndUploadFile: EncryptAndUploadFunctionFile;
};

export default function EditorSidebar({
  editor,
  headingLevels,
  encryptAndUploadFile,
}: EditorSidebarProps) {
  const fileInputRef = useRef<any>();
  const insertImage = async ({
    uploadId,
    width,
    height,
  }: InsertImageParams) => {
    if (!editor) {
      return;
    }
    editor.commands.insertContent({
      type: "image",
      attrs: {
        uploadId,
        width,
        height,
      },
    });
  };

  const testFileUpload = async (event: any) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = function (e) {
      const buf = e.target?.result as ArrayBuffer;
      const data = Buffer.from(buf).toString("base64");
      console.log(data);
      insertImages({
        encryptAndUploadFile,
        filesAsBase64: [data],
        insertImage,
        updateImageAttributes: (params: UpdateImageAttributesParams) => {
          if (!editor) {
            return;
          }
          updateImageAttributes({ ...params, view: editor.view });
        },
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <View
      style={tw`w-sidebar h-full border-l border-gray-200 bg-gray-100 pt-4`}
    >
      <Heading lvl={4} style={tw`ml-4`} padded>
        Formats
      </Heading>

      <SidebarButton onPress={() => editor?.chain().focus().toggleBold().run()}>
        <EditorSidebarIcon
          isActive={editor?.isActive("bold") || false}
          name="bold"
        />
        <Text variant="xs" bold={editor?.isActive("bold") || false}>
          Bold
        </Text>
      </SidebarButton>

      <SidebarButton
        onPress={() => editor?.chain().focus().toggleItalic().run()}
      >
        <EditorSidebarIcon
          isActive={editor?.isActive("italic") || false}
          name="italic"
        />
        <Text variant="xs" bold={editor?.isActive("italic") || false}>
          Italic
        </Text>
      </SidebarButton>

      <SidebarButton onPress={() => editor?.chain().focus().toggleCode().run()}>
        <EditorSidebarIcon
          isActive={editor?.isActive("code") || false}
          name="code-view"
        />
        <Text variant="xs" bold={editor?.isActive("code") || false}>
          Code
        </Text>
      </SidebarButton>

      {/* styling dummy */}
      <SidebarButton
        onPress={() => editor?.chain().focus().toggleLink({ href: "#" }).run()}
      >
        <EditorSidebarIcon
          isActive={editor?.isActive("link") || false}
          name="link"
        />
        <Text variant="xs" bold={editor?.isActive("link") || false}>
          Link
        </Text>
      </SidebarButton>

      <SidebarDivider />

      <Heading lvl={4} style={tw`ml-4`} padded>
        Blocks
      </Heading>

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
              name={`h-${lvl}`}
            />
            <Text
              variant="xs"
              bold={editor?.isActive("heading", { level: lvl }) || false}
            >
              Headline {lvl}
            </Text>
          </SidebarButton>
        );
      })}

      <SidebarButton
        onPress={() => editor?.chain().focus().toggleCodeBlock().run()}
      >
        <EditorSidebarIcon
          isActive={editor?.isActive("codeBlock") || false}
          name="code-s-slash-line"
        />
        <Text variant="xs" bold={editor?.isActive("codeBlock") || false}>
          Codeblock
        </Text>
      </SidebarButton>

      <SidebarButton
        onPress={() => editor?.chain().focus().toggleBlockquote().run()}
      >
        <EditorSidebarIcon
          isActive={editor?.isActive("blockquote") || false}
          name="double-quotes-l"
        />
        <Text variant="xs" bold={editor?.isActive("blockquote") || false}>
          Blockquote
        </Text>
      </SidebarButton>

      <SidebarDivider />

      <Heading lvl={4} style={tw`ml-4`} padded>
        Lists
      </Heading>

      <SidebarButton
        onPress={() => editor?.chain().focus().toggleBulletList().run()}
      >
        <EditorSidebarIcon
          isActive={editor?.isActive("bulletList") || false}
          name="list-unordered"
        />
        <Text variant="xs" bold={editor?.isActive("bulletList") || false}>
          Bullet-List
        </Text>
      </SidebarButton>

      <SidebarButton
        onPress={() => editor?.chain().focus().toggleOrderedList().run()}
      >
        <EditorSidebarIcon
          isActive={editor?.isActive("orderedList") || false}
          name="list-ordered"
        />
        <Text variant="xs" bold={editor?.isActive("orderedList") || false}>
          Numbered-List
        </Text>
      </SidebarButton>

      <SidebarButton
        onPress={() => editor?.chain().focus().toggleTaskList().run()}
      >
        <EditorSidebarIcon
          isActive={editor?.isActive("taskList") || false}
          name="list-check-2"
        />
        <Text variant="xs" bold={editor?.isActive("taskList") || false}>
          Check-List
        </Text>
      </SidebarButton>

      <SidebarDivider />

      <Heading lvl={4} style={tw`ml-4`} padded>
        Images
      </Heading>

      <SidebarButton
        onPress={() => {
          initiateImagePicker({
            encryptAndUploadFile,
            insertImage,
            updateImageAttributes: (params: UpdateImageAttributesParams) => {
              if (!editor) {
                return;
              }
              updateImageAttributes({ ...params, view: editor.view });
            },
          });
        }}
        testID="editor-sidebar__add-image"
      >
        <EditorSidebarIcon isActive={false} name="image-line" />
        <Text variant="xs" bold={false}>
          Upload Image
        </Text>
      </SidebarButton>
      {Platform.OS === "web" && (
        <input
          ref={fileInputRef}
          type="file"
          onChange={testFileUpload}
          data-testid="editor-sidebar__add-image--file-input"
        />
      )}
    </View>
  );
}
