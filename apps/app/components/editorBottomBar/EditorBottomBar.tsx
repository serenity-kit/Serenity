import React from "react";
import { EditorToolbarButton, ScrollView, Text, tw } from "@serenity-tools/ui";
import { EditorToolbarState, UpdateEditor } from "@serenity-tools/editor";
import { HStack } from "native-base";

export type EditorBottombarProps = {
  onUpdate: UpdateEditor;
  editorToolbarState: EditorToolbarState;
};

export const editorToolbarHeight = 48;

export function EditorBottombar({
  onUpdate,
  editorToolbarState,
}: EditorBottombarProps) {
  return (
    <ScrollView
      horizontal={true}
      style={[
        tw`flex flex-row flex-nowrap h-${
          editorToolbarHeight / 4
        } px-2.5 border-t border-gray-200`,
      ]}
    >
      <HStack space={2} alignItems="center">
        <EditorToolbarButton
          onPress={(event) => {
            onUpdate({ variant: "toggle-bold" });
          }}
          name="bold"
          isActive={editorToolbarState.isBold}
        />
        <EditorToolbarButton
          onPress={(event) => {
            onUpdate({ variant: "toggle-italic" });
          }}
          name="italic"
          isActive={editorToolbarState.isItalic}
        />

        <Text>
          here more buttons will come soon, but needed a long text for testing
          the horizontal scroll
        </Text>
      </HStack>
    </ScrollView>
  );
}
