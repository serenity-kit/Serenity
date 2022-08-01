import React from "react";
import {
  EditorBottombarButton,
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

        <Text>
          here more buttons will come soon, but needed a long text for testing
          the horizontal scroll
        </Text>
      </HStack>
    </ScrollView>
  );
}
