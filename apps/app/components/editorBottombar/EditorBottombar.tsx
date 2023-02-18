import { EditorBottombarState, UpdateEditor } from "@serenity-tools/editor";
import {
  EncryptAndUploadFunctionFile,
  initiateImagePicker,
  InsertImageParams,
  UpdateFileAttributesParams,
} from "@serenity-tools/editor-file-extension";
import {
  EditorBottombarButton,
  EditorBottombarDivider,
  ScrollView,
  tw,
  View,
} from "@serenity-tools/ui";
import { HStack } from "native-base";
import { forwardRef, useState } from "react";

export type EditorBottombarProps = {
  onUpdate: UpdateEditor;
  editorBottombarState: EditorBottombarState;
  encryptAndUploadFile: EncryptAndUploadFunctionFile;
};

export const editorBottombarHeight = 48;

export const EditorBottombar = forwardRef(
  (
    {
      onUpdate,
      editorBottombarState,
      encryptAndUploadFile,
    }: EditorBottombarProps,
    ref
  ) => {
    const [mode, setMode] = useState<"toolbar" | "createComment">("toolbar");

    if (mode === "createComment") {
      <View
        style={[tw`h-${editorBottombarHeight / 2} border-t border-gray-200`]}
      >
        <EditorBottombarButton
          onPress={(event) => {
            onUpdate({ variant: "toggle-bold" });
          }}
          name="bold"
          isActive={editorBottombarState.isBold}
        />
      </View>;
    }

    return (
      <ScrollView
        horizontal={true}
        style={[tw`h-${editorBottombarHeight / 4} border-t border-gray-200`]}
        contentContainerStyle={tw`px-2.5`} // needed here as it isn't handled correctly on the parent element
        ref={ref}
      >
        <HStack space={2} alignItems="center">
          <EditorBottombarButton
            onPress={(event) => {
              onUpdate({ variant: "toggle-bold" });
            }}
            name="bold"
            isActive={editorBottombarState.isBold}
          />
          <EditorBottombarButton
            onPress={(event) => {
              onUpdate({ variant: "toggle-italic" });
            }}
            name="italic"
            isActive={editorBottombarState.isItalic}
          />
          <EditorBottombarButton
            onPress={(event) => {
              onUpdate({ variant: "toggle-code" });
            }}
            name="code-view"
            isActive={editorBottombarState.isCode}
          />
          <EditorBottombarButton
            onPress={(event) => {
              onUpdate({ variant: "toggle-link" });
            }}
            name="link"
            isActive={editorBottombarState.isLink}
          />

          <EditorBottombarDivider />

          <EditorBottombarButton
            onPress={(event) => {
              onUpdate({ variant: "toggle-heading-1" });
            }}
            name="h-1"
            isActive={editorBottombarState.isHeading1}
          />
          <EditorBottombarButton
            onPress={(event) => {
              onUpdate({ variant: "toggle-heading-2" });
            }}
            name="h-2"
            isActive={editorBottombarState.isHeading2}
          />
          <EditorBottombarButton
            onPress={(event) => {
              onUpdate({ variant: "toggle-heading-3" });
            }}
            name="h-3"
            isActive={editorBottombarState.isHeading3}
          />
          <EditorBottombarButton
            onPress={(event) => {
              onUpdate({ variant: "toggle-code-block" });
            }}
            name="code-s-slash-line"
            isActive={editorBottombarState.isCodeBlock}
          />
          <EditorBottombarButton
            onPress={(event) => {
              onUpdate({ variant: "toggle-blockquote" });
            }}
            name="double-quotes-l"
            isActive={editorBottombarState.isBlockquote}
          />

          <EditorBottombarDivider />

          <EditorBottombarButton
            onPress={(event) => {
              onUpdate({ variant: "toggle-bullet-list" });
            }}
            name="list-unordered"
            isActive={editorBottombarState.isBulletList}
          />
          <EditorBottombarButton
            onPress={(event) => {
              onUpdate({ variant: "toggle-ordered-list" });
            }}
            name="list-ordered"
            isActive={editorBottombarState.isOrderedList}
          />
          <EditorBottombarButton
            onPress={(event) => {
              onUpdate({ variant: "toggle-task-list" });
            }}
            name="list-check-2"
            isActive={editorBottombarState.isTaskList}
          />

          <EditorBottombarDivider />

          <EditorBottombarButton
            onPress={(event) => {
              initiateImagePicker({
                encryptAndUploadFile,
                insertImage: (params: InsertImageParams) => {
                  onUpdate({ variant: "insert-image", params });
                },
                updateFileAttributes: (params: UpdateFileAttributesParams) => {
                  onUpdate({ variant: "update-image-attributes", params });
                },
              });
            }}
            name="image-line"
            isActive={false}
          />

          <EditorBottombarDivider />

          <EditorBottombarButton
            onPress={() => {
              setMode("createComment");
            }}
            name="cup-line"
            isActive={true}
          />
        </HStack>
      </ScrollView>
    );
  }
);
