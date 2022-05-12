import { useHasEditorSidebar } from "@serenity-tools/editor/hooks/useHasEditorSidebar";
import { Text, tw, View } from "@serenity-tools/ui";
import React from "react";

export function PageHeaderRight() {
  const hasEditorSidebar = useHasEditorSidebar();

  if (!hasEditorSidebar) {
    return <Text>Mobile Header Right</Text>;
  }

  return (
    <View style={tw`h-full w-60 border-l border-b border-gray-200 bg-gray-100`}>
      <Text>Desktop Header Right</Text>
    </View>
  );
}
