import { useWindowDimensions } from "react-native";

export const editorSidebarBreakPoint = 768; // md

export function useHasEditorSidebar() {
  const { width } = useWindowDimensions();
  return width > editorSidebarBreakPoint;
}
