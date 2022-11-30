import { useWindowDimensions } from "react-native";

export const sidebarBreakPoint = 1024; // lg

export function useIsPermanentLeftSidebar() {
  const { width } = useWindowDimensions();
  return width > sidebarBreakPoint;
}
