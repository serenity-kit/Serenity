import { EditorBottombarState, UpdateEditor } from "@serenity-tools/editor";
import {
  EncryptAndUploadFunctionFile,
  InsertImageParams,
  UpdateFileAttributesParams,
  initiateImagePicker,
} from "@serenity-tools/editor-file-extension";
import {
  EditorBottombarButton,
  ScrollView,
  VerticalDivider,
  tw,
} from "@serenity-tools/ui";
import { HStack } from "native-base";
import { forwardRef } from "react";
import { DocumentState } from "../../types/documentState";

export type EditorBottombarProps = {
  onUpdate: UpdateEditor;
  editorBottombarState: EditorBottombarState;
  encryptAndUploadFile: EncryptAndUploadFunctionFile;
  documentState: DocumentState;
};

export const editorBottombarHeight = 48;

export const EditorBottombar = forwardRef(
  (
    {
      onUpdate,
      editorBottombarState,
      encryptAndUploadFile,
      documentState,
    }: EditorBottombarProps,
    ref
  ) => {
    const isDisabledAction = documentState !== "active";

    return (
      <ScrollView
        horizontal={true}
        style={[tw`h-${editorBottombarHeight / 4} border-t border-gray-300`]}
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
            isDisabled={isDisabledAction}
          />
          <EditorBottombarButton
            onPress={(event) => {
              onUpdate({ variant: "toggle-italic" });
            }}
            name="italic"
            isActive={editorBottombarState.isItalic}
            isDisabled={isDisabledAction}
          />
          <EditorBottombarButton
            onPress={(event) => {
              onUpdate({ variant: "toggle-code" });
            }}
            name="code-view"
            isActive={editorBottombarState.isCode}
            isDisabled={isDisabledAction}
          />
          <EditorBottombarButton
            onPress={(event) => {
              onUpdate({ variant: "toggle-link" });
            }}
            name="link"
            isActive={editorBottombarState.isLink}
            isDisabled={isDisabledAction}
          />

          <VerticalDivider />

          <EditorBottombarButton
            onPress={(event) => {
              onUpdate({ variant: "toggle-heading-1" });
            }}
            name="h-1"
            isActive={editorBottombarState.isHeading1}
            isDisabled={isDisabledAction}
          />
          <EditorBottombarButton
            onPress={(event) => {
              onUpdate({ variant: "toggle-heading-2" });
            }}
            name="h-2"
            isActive={editorBottombarState.isHeading2}
            isDisabled={isDisabledAction}
          />
          <EditorBottombarButton
            onPress={(event) => {
              onUpdate({ variant: "toggle-heading-3" });
            }}
            name="h-3"
            isActive={editorBottombarState.isHeading3}
            isDisabled={isDisabledAction}
          />
          <EditorBottombarButton
            onPress={(event) => {
              onUpdate({ variant: "toggle-code-block" });
            }}
            name="code-s-slash-line"
            isActive={editorBottombarState.isCodeBlock}
            isDisabled={isDisabledAction}
          />
          <EditorBottombarButton
            onPress={(event) => {
              onUpdate({ variant: "toggle-blockquote" });
            }}
            name="double-quotes-l"
            isActive={editorBottombarState.isBlockquote}
            isDisabled={isDisabledAction}
          />

          <VerticalDivider />

          <EditorBottombarButton
            onPress={(event) => {
              onUpdate({ variant: "toggle-bullet-list" });
            }}
            name="list-unordered"
            isActive={editorBottombarState.isBulletList}
            isDisabled={isDisabledAction}
          />
          <EditorBottombarButton
            onPress={(event) => {
              onUpdate({ variant: "toggle-ordered-list" });
            }}
            name="list-ordered"
            isActive={editorBottombarState.isOrderedList}
            isDisabled={isDisabledAction}
          />
          <EditorBottombarButton
            onPress={(event) => {
              onUpdate({ variant: "toggle-task-list" });
            }}
            name="list-check-2"
            isActive={editorBottombarState.isTaskList}
            isDisabled={isDisabledAction}
          />

          <VerticalDivider />

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
            isDisabled={isDisabledAction}
          />
        </HStack>
      </ScrollView>
    );
  }
);
