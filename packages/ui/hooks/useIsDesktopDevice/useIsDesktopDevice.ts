import { Platform } from "react-native";
import { useIsEqualOrLargerThanBreakpoint } from "../useIsEqualOrLargerThanBreakpoint/useIsEqualOrLargerThanBreakpoint";

export const useIsDesktopDevice = () => {
  const isEqualOrLargerThanBreakpoint = useIsEqualOrLargerThanBreakpoint("md");

  return Platform.OS === "web" && isEqualOrLargerThanBreakpoint;
};
