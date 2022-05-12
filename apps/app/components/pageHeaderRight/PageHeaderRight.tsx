import { useHasEditorSidebar } from "@serenity-tools/editor/hooks/useHasEditorSidebar";
import { Text } from "@serenity-tools/ui";
import React from "react";

export function PageHeaderRight() {
  const hasEditorSidebar = useHasEditorSidebar();

  if (!hasEditorSidebar) {
    return <Text>Mobile Header Right</Text>;
  }

  return <Text>Desktop Header Right</Text>;
}
