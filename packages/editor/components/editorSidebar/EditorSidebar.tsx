import React from "react";
import { tw, View, Text } from "@serenity-tools/ui";

type EditorSidebarProps = {
  // children: React.ReactNode;
};

export default function EditorSidebar(props: EditorSidebarProps) {
  return (
    <View style={tw`w-60 h-full border-l border-gray-200`}>
      <Text>Hello World</Text>
    </View>
  );
}
