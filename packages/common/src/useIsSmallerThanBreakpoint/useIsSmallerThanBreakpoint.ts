import { useWindowDimensions } from "react-native";
import { theme } from "../../../../tailwind.config";
import { Breakpoint } from "../types";

export const useIsSmallerThanBreakpoint = (breakpoint: Breakpoint) => {
  const { width } = useWindowDimensions();

  return width < parseInt(theme.screens[breakpoint].replace("px"), 10);
};
