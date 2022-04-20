import { useWindowDimensions } from "react-native";

export const sidebarBreakPoint = 800;

export default function useIsPermanentSidebar() {
  const { width } = useWindowDimensions();
  return width > sidebarBreakPoint;
}
