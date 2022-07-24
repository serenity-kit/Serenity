import React from "react";
import {
  EditorSidebarIcon,
  ScrollView,
  SidebarButton,
  Text,
  tw,
  View,
} from "@serenity-tools/ui";
import { EditorToolbarState, UpdateEditor } from "@serenity-tools/editor";

export type EditorBottomBarProps = {
  onUpdate: UpdateEditor;
  editorToolbarState: EditorToolbarState;
};

export const editorToolbarHeight = 48;

export function EditorBottomBar({
  onUpdate,
  editorToolbarState,
}: EditorBottomBarProps) {
  return (
    <ScrollView
      horizontal={true}
      style={[
        tw`flex flex-row flex-nowrap border-t border-gray-200`,
        {
          height: editorToolbarHeight,
        },
      ]}
    >
      <SidebarButton
        onPress={(event) => {
          onUpdate({ variant: "toggle-bold" });
        }}
      >
        <EditorSidebarIcon isActive={editorToolbarState.isBold} name="bold" />
      </SidebarButton>
      <SidebarButton
        onPress={(event) => {
          onUpdate({ variant: "toggle-italic" });
        }}
      >
        <EditorSidebarIcon
          isActive={editorToolbarState.isItalic}
          name="italic"
        />
      </SidebarButton>

      <Text>
        here more buttons will come soon, but needed a long text for testing the
        horizontal scroll
      </Text>
    </ScrollView>
  );
}
