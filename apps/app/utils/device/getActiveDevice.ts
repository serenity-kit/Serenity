import { LocalDevice } from "@serenity-tools/common";
import { Platform } from "react-native";
import { getDevice } from "./deviceStore";
import { getMainDevice } from "./mainDeviceMemoryStore";
import { getOrFetchWebDevice } from "./webDeviceStore";

export const getActiveDevice = async (): Promise<LocalDevice | null> => {
  let device: LocalDevice | null = null;
  if (Platform.OS === "web") {
    device = await getOrFetchWebDevice();
  } else if (Platform.OS === "ios") {
    device = await getDevice();
  }
  if (!device) {
    device = getMainDevice();
  }
  return device;
};
