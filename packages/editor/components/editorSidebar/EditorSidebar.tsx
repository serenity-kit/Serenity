import {
  EditorSidebarIcon,
  Heading,
  SidebarButton,
  SidebarDivider,
  Tab,
  TabList,
  TabPanel,
  Text,
  tw,
  View,
} from "@serenity-tools/ui";
import { Level } from "@tiptap/extension-heading";
import { Editor } from "@tiptap/react";
import React from "react";
import { Platform } from "react-native";
import {
  EncryptAndUploadFunctionFile,
  initiateImagePicker,
  insertFiles,
  InsertImageParams,
  insertImages,
  updateFileAttributes,
  UpdateFileAttributesParams,
} from "../../../editor-file-extension/src";
import { fileToBase64 } from "../../../editor-file-extension/src/utils/fileToBase64";
import TableOfContents from "../tableOfContents/TableOfContents";

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
  const [activeTab, setActiveTab] = React.useState<
    "editing" | "tableOfContents"
  >("editing");

  return (
    <View style={tw`w-sidebar h-full border-l border-gray-200 bg-gray-100`}>
      <TabList accessibilityLabel="Editor sidebar Tabs">
        <Tab
          tabId="editing"
          isActive={activeTab === "editing"}
          onPress={() => {
            setActiveTab("editing");
          }}
        >
          Edit
        </Tab>
        <Tab
          tabId="tableOfContents"
          isActive={activeTab === "tableOfContents"}
          onPress={() => {
            setActiveTab("tableOfContents");
          }}
        >
          Table of Contents
        </Tab>
      </TabList>

      {activeTab === "tableOfContents" ? (
        <TabPanel tabId="tableOfContents">
          <TableOfContents editor={editor} />
        </TabPanel>
      ) : (
        <TabPanel tabId="editing">
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
                  isActive={
                    editor?.isActive("heading", { level: lvl }) || false
                  }
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
                insertImage: ({
                  uploadId,
                  width,
                  height,
                  mimeType,
                }: InsertImageParams) => {
                  if (!editor) {
                    return;
                  }
                  editor.commands.insertContent({
                    type: "file",
                    attrs: {
                      subtype: "image",
                      subtypeAttributes: {
                        width,
                        height,
                      },
                      mimeType,
                      uploadId,
                    },
                  });
                },
                updateFileAttributes: (params: UpdateFileAttributesParams) => {
                  if (!editor) {
                    return;
                  }
                  updateFileAttributes({ ...params, view: editor.view });
                },
              });
            }}
          >
            <EditorSidebarIcon isActive={false} name="image-line" />
            <Text variant="xs" bold={false}>
              Upload Image
            </Text>
          </SidebarButton>

          {Platform.OS === "web" ? (
            <SidebarButton
              onPress={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.multiple = true;
                input.onchange = async (event) => {
                  if (!editor) {
                    return;
                  }
                  const target = event.target as HTMLInputElement;
                  if (!target.files) {
                    return;
                  }

                  const files = Array.from(target.files).map((file) => {
                    return {
                      type: /image/i.test(file.type) ? "image" : "file",
                      file,
                    };
                  });
                  if (files.length === 0) {
                    return false;
                  }

                  event.preventDefault();

                  const filesAsBase64 = await Promise.all(
                    files.map(async (file) => {
                      const fileAsBase64 = await fileToBase64(file.file);
                      return {
                        detectedType: file.type,
                        fileAsBase64,
                        fileName: file.file.name,
                        fileSize: file.file.size,
                        fileType: file.file.type,
                      };
                    })
                  );

                  filesAsBase64.forEach((fileAsBase64) => {
                    if (fileAsBase64.detectedType === "image") {
                      insertImages({
                        filesWithBase64Content: [
                          {
                            content: fileAsBase64.fileAsBase64,
                            mimeType: fileAsBase64.fileType,
                          },
                        ],
                        encryptAndUploadFile,
                        insertImage: ({ uploadId, width, height }) => {
                          editor.commands.insertContent(
                            {
                              type: "file",
                              attrs: {
                                subtype: "image",
                                subtypeAttributes: {
                                  width,
                                  height,
                                },
                                uploadId,
                                mimeType: fileAsBase64.fileType,
                              },
                            },
                            { updateSelection: false }
                          );
                        },
                        updateFileAttributes: (params) => {
                          updateFileAttributes({
                            ...params,
                            view: editor.view,
                          });
                        },
                      });
                    } else {
                      insertFiles({
                        filesWithBase64Content: [
                          {
                            content: fileAsBase64.fileAsBase64,
                            name: fileAsBase64.fileName,
                            size: fileAsBase64.fileSize,
                            mimeType: fileAsBase64.fileType,
                          },
                        ],
                        encryptAndUploadFile,
                        insertFile: ({ uploadId, fileName, fileSize }) => {
                          editor.commands.insertContent(
                            {
                              type: "file",
                              attrs: {
                                subtype: "file",
                                subtypeAttributes: {
                                  fileName,
                                  fileSize,
                                },
                                uploadId,
                                mimeType: fileAsBase64.fileType,
                              },
                            },
                            { updateSelection: false }
                          );
                        },
                        updateFileAttributes: (params) => {
                          updateFileAttributes({
                            ...params,
                            view: editor.view,
                          });
                        },
                      });
                    }
                  });
                };
                input.click();
              }}
            >
              <EditorSidebarIcon isActive={false} name="image-line" />
              <Text variant="xs" bold={false}>
                Upload File
              </Text>
            </SidebarButton>
          ) : null}

          <SidebarDivider />

          <Heading lvl={4} style={tw`ml-4`} padded>
            Formats
          </Heading>

          <SidebarButton
            onPress={() => editor?.chain().focus().toggleBold().run()}
          >
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

          <SidebarButton
            onPress={() => editor?.chain().focus().toggleCode().run()}
          >
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
            onPress={() =>
              editor?.chain().focus().toggleLink({ href: "#" }).run()
            }
          >
            <EditorSidebarIcon
              isActive={editor?.isActive("link") || false}
              name="link"
            />
            <Text variant="xs" bold={editor?.isActive("link") || false}>
              Link
            </Text>
          </SidebarButton>
        </TabPanel>
      )}
    </View>
  );
}
