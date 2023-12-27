import {
  EncryptAndUploadFunctionFile,
  FileNodeAttributes,
  fileToBase64,
  initiateImagePicker,
  insertFiles,
  InsertImageParams,
  insertImages,
  updateFileAttributes,
  UpdateFileAttributesParams,
} from "@serenity-tools/editor-file-extension";
import {
  EditorSidebarIcon,
  Heading,
  HorizontalDivider,
  IconButton,
  RawInput,
  SidebarButton,
  Tab,
  TabList,
  TabPanel,
  Text,
  tw,
  View,
} from "@serenity-tools/ui";
import { Level } from "@tiptap/extension-heading";
import { Editor } from "@tiptap/react";
import { HStack } from "native-base";
import React from "react";
import { Platform } from "react-native";
import TableOfContents from "../tableOfContents/TableOfContents";

type DocumentState = "active" | "loading" | "error";

type EditorSidebarProps = {
  editor: Editor | null;
  headingLevels: Level[];
  encryptAndUploadFile: EncryptAndUploadFunctionFile;
  documentState: DocumentState;
  editable: boolean;
};

export function debounce<
  Func extends (...args: Parameters<Func>) => ReturnType<Func>
>(func: Func, waitFor: number): (...args: Parameters<Func>) => void {
  let timeout: any;
  return (...args: Parameters<Func>): void => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), waitFor);
  };
}

export default function EditorSidebar({
  editor,
  headingLevels,
  encryptAndUploadFile,
  documentState,
  editable,
}: EditorSidebarProps) {
  const [activeTab, setActiveTab] = React.useState<
    "editing" | "tableOfContents"
  >("editing");
  const [searchTerm, setSearchTerm] = React.useState("");

  const muteHeading = documentState !== "active";
  const disableButton = documentState !== "active" || editable === false;
  const disableTab = documentState === "loading";

  const debouncedScrollSearchResultIntoView = React.useMemo(() => {
    return debounce(() => {
      if (!editor) {
        return;
      }
      editor.chain().scrollSearchResultIntoView().run();
    }, 400);
  }, []);

  return (
    <>
      <TabList aria-label="Editor sidebar Tabs">
        <Tab
          tabId="editing"
          isActive={activeTab === "editing"}
          onPress={() => {
            setActiveTab("editing");
          }}
          disabled={disableTab}
        >
          Edit
        </Tab>
        <Tab
          tabId="tableOfContents"
          isActive={activeTab === "tableOfContents"}
          onPress={() => {
            setActiveTab("tableOfContents");
          }}
          disabled={disableTab}
        >
          Table of Contents
        </Tab>
      </TabList>

      {activeTab === "tableOfContents" ? (
        <TabPanel tabId="tableOfContents">
          <Heading lvl={4} style={tw`ml-4`} padded muted={muteHeading}>
            Search
          </Heading>

          <HStack style={tw`mx-4 items-center`}>
            <RawInput
              value={searchTerm}
              onChangeText={(text) => {
                setSearchTerm(text);
                editor?.chain().updateSearchTerm(text).run();
                // longer timeout to avoid scrolling while typing fast
                debouncedScrollSearchResultIntoView();
              }}
              style={tw`w-36`}
            />

            <View style={{ transform: [{ rotate: "180deg" }] }}>
              <IconButton
                size={"lg"}
                onPress={() => {
                  editor?.chain().goToPreviousResult().run();
                  // first the content of the editor must be updated
                  setTimeout(() => {
                    editor?.chain().scrollSearchResultIntoView().run();
                  }, 100);
                }}
                name="arrow-down-s-line"
                disabled={searchTerm === ""}
                color="black"
              />
            </View>
            <IconButton
              size={"lg"}
              onPress={() => {
                editor?.chain().goToNextResult().run();
                // first the content of the editor must be updated
                setTimeout(() => {
                  editor?.chain().scrollSearchResultIntoView().run();
                }, 100);
              }}
              name="arrow-down-s-line"
              disabled={searchTerm === ""}
              color="black"
            />
          </HStack>

          <HorizontalDivider />

          <TableOfContents editor={editor} />
        </TabPanel>
      ) : (
        <TabPanel tabId="editing">
          <Heading lvl={4} style={tw`ml-4`} padded muted={muteHeading}>
            Blocks
          </Heading>

          {headingLevels.map((lvl) => {
            return (
              <SidebarButton
                disabled={disableButton}
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
            disabled={disableButton}
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
            disabled={disableButton}
          >
            <EditorSidebarIcon
              isActive={editor?.isActive("blockquote") || false}
              name="double-quotes-l"
            />
            <Text variant="xs" bold={editor?.isActive("blockquote") || false}>
              Blockquote
            </Text>
          </SidebarButton>

          <HorizontalDivider />

          <Heading lvl={4} style={tw`ml-4`} padded muted={muteHeading}>
            Lists
          </Heading>

          <SidebarButton
            onPress={() => editor?.chain().focus().toggleBulletList().run()}
            disabled={disableButton}
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
            disabled={disableButton}
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
            disabled={disableButton}
          >
            <EditorSidebarIcon
              isActive={editor?.isActive("taskList") || false}
              name="list-check-2"
            />
            <Text variant="xs" bold={editor?.isActive("taskList") || false}>
              Check-List
            </Text>
          </SidebarButton>

          <HorizontalDivider />

          <Heading lvl={4} style={tw`ml-4`} padded muted={muteHeading}>
            Media
          </Heading>

          <SidebarButton
            disabled={disableButton}
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
                  const attrs: FileNodeAttributes = {
                    subtype: "image",
                    subtypeAttributes: {
                      width,
                      height,
                    },
                    mimeType,
                    uploadId,
                  };
                  editor.commands.insertContent(
                    { type: "file", attrs },
                    { updateSelection: false }
                  );
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
              Image
            </Text>
          </SidebarButton>

          {Platform.OS === "web" ? (
            <SidebarButton
              disabled={disableButton}
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
                          const attrs: FileNodeAttributes = {
                            subtype: "image",
                            subtypeAttributes: {
                              width,
                              height,
                            },
                            uploadId,
                            mimeType: fileAsBase64.fileType,
                          };
                          editor.commands.insertContent(
                            { type: "file", attrs },
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
                          const attrs: FileNodeAttributes = {
                            subtype: "file",
                            subtypeAttributes: {
                              fileName,
                              fileSize,
                            },
                            uploadId,
                            mimeType: fileAsBase64.fileType,
                          };
                          editor.commands.insertContent(
                            { type: "file", attrs },
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
              <EditorSidebarIcon isActive={false} name="attachment-2" />
              <Text variant="xs" bold={false}>
                File
              </Text>
            </SidebarButton>
          ) : null}

          <HorizontalDivider />

          <Heading lvl={4} style={tw`ml-4`} padded muted={muteHeading}>
            Blocks
          </Heading>

          <SidebarButton
            disabled={disableButton}
            onPress={() =>
              editor
                ?.chain()
                .focus()
                .insertTable({ rows: 2, cols: 2, withHeaderRow: false })
                .run()
            }
          >
            <EditorSidebarIcon isActive={false} name="table-2" />
            <Text variant="xs" bold={false}>
              Table
            </Text>
          </SidebarButton>
        </TabPanel>
      )}
    </>
  );
}
