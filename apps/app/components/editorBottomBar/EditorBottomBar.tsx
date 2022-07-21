import React from "react";
import { EditorSidebarIcon, SidebarButton } from "@serenity-tools/ui";
import { KeyboardAvoidingView } from "react-native";
import { EditorToolbarState, UpdateEditor } from "@serenity-tools/editor";

type Props = {
  onUpdate: UpdateEditor;
  editorToolbarState: EditorToolbarState;
};

export function EditorBottomBar({ onUpdate, editorToolbarState }: Props) {
  return (
    <KeyboardAvoidingView
      behavior={"position"}
      style={{ paddingBottom: 80 }}
      contentContainerStyle={{
        backgroundColor: "#ff00ff",
        // flex: 1,
        // flexDirection: "row",
        // width: "100%",
      }}
    >
      <SidebarButton
        onPress={() => {
          onUpdate({ variant: "toggle-bold" });
        }}
      >
        <EditorSidebarIcon isActive={editorToolbarState.isBold} name="bold" />
      </SidebarButton>

      <SidebarButton
        onPress={() => {
          onUpdate({ variant: "toggle-italic" });
        }}
      >
        <EditorSidebarIcon
          isActive={editorToolbarState.isItalic}
          name="italic"
        />
      </SidebarButton>
    </KeyboardAvoidingView>
  );
}
