import { useWindowDimensions } from "react-native";

export const editorSidebarBreakPoint = 600;

export function useHasEditorSidebar() {
  const { width } = useWindowDimensions();
  return width > editorSidebarBreakPoint;
}
