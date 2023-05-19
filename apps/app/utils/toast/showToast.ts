import { tw } from "@serenity-tools/ui";
import Toast, { ToastOptions } from "react-native-root-toast";

export const showToast = (
  message: string,
  variant: "info" | "error" = "info",
  options?: ToastOptions
) => {
  return Toast.show(message, {
    duration: Toast.durations.LONG,
    position: Toast.positions.BOTTOM,
    shadow: true,
    animation: true,
    hideOnPress: true,
    delay: 0,
    backgroundColor:
      variant === "info" ? tw.color("gray-900") : tw.color("error-500"),
    opacity: 1,
    containerStyle: tw`py-3 px-8 `,
    textStyle: tw`text-xs inter-regular`,
    ...options,
  });
};
