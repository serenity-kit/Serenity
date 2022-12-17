import { useIsEqualOrLargerThanBreakpoint } from "../useIsEqualOrLargerThanBreakpoint/useIsEqualOrLargerThanBreakpoint";

export const useIsDesktopDevice = () => {
  const isEqualOrLargerThanBreakpoint = useIsEqualOrLargerThanBreakpoint("md");

  return isEqualOrLargerThanBreakpoint;
};
