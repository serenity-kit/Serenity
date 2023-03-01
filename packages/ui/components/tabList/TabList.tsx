import React from "react";
import { tw } from "../../tailwind";
import {
  EditorSidebarHeader,
  EditorSidebarHeaderProps,
} from "../editorSidebarHeader/EditorSidebarHeader";

export type TabListProps = EditorSidebarHeaderProps & {
  accessibilityLabel: string;
};

export function TabList(props: TabListProps) {
  return (
    <EditorSidebarHeader
      {...props}
      accessibilityRole="tablist"
      style={tw`px-2`}
    />
  );
}
