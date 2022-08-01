import React from "react";
import {
  EditorBottombarButton,
  EditorBottombarDivider,
  ScrollView,
  Text,
  tw,
} from "@serenity-tools/ui";
import { EditorBottombarState, UpdateEditor } from "@serenity-tools/editor";
import { HStack } from "native-base";

export type EditorBottombarProps = {
  onUpdate: UpdateEditor;
  editorBottombarState: EditorBottombarState;
};

export const editorBottombarHeight = 48;

export function EditorBottombar({
  onUpdate,
  editorBottombarState,
}: EditorBottombarProps) {
  return (
    <ScrollView
      horizontal={true}
      style={[
        tw`flex flex-row flex-nowrap h-${
          editorBottombarHeight / 4
        } px-2.5 border-t border-gray-200`,
      ]}
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
          isActive={editorBottombarState.isItalic}
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
      </HStack>
    </ScrollView>
  );
}
