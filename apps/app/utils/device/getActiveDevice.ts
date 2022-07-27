import { Platform } from "react-native";
import { Device } from "../../types/Device";
import { getDevice } from "./deviceStore";
import { getMainDevice } from "./mainDeviceMemoryStore";
import { getWebDevice } from "./webDeviceStore";

export const getActiveDevice = async (): Promise<Device | null> => {
  let device: Device | null = null;
  if (Platform.OS === "web") {
    device = await getWebDevice();
  } else if (Platform.OS === "ios") {
    device = await getDevice();
  } else {
    device = getMainDevice();
  }
  return device;
};
