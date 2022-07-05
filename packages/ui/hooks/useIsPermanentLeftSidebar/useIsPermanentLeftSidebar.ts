import { useWindowDimensions } from "react-native";

export const sidebarBreakPoint = 1000;

export function useIsPermanentLeftSidebar() {
  const { width } = useWindowDimensions();
  return width > sidebarBreakPoint;
}
