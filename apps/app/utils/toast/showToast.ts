import { tw } from "@serenity-tools/ui";
import Toast, { ToastOptions } from "react-native-root-toast";

export const showToast = (message: string, options?: ToastOptions) => {
  return Toast.show(message, {
    duration: Toast.durations.LONG,
    position: Toast.positions.BOTTOM,
    shadow: true,
    animation: true,
    hideOnPress: true,
    delay: 0,
    backgroundColor: tw.color("gray-900"),
    opacity: 1,
    containerStyle: tw`py-3 px-8`,
    textStyle: tw`text-xs inter-regular`,
    ...options,
  });
};
