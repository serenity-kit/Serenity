import React from "react";
import { tw } from "../../tailwind";
import {
  EditorSidebarHeader,
  EditorSidebarHeaderProps,
} from "../editorSidebarHeader/EditorSidebarHeader";

export type TabListProps = EditorSidebarHeaderProps;

export function TabList(props: TabListProps) {
  return <EditorSidebarHeader {...props} role="tablist" style={tw`px-2`} />;
}
