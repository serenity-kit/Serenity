import { LocalDevice } from "@serenity-tools/common";
import { getDevice } from "../../store/deviceStore/deviceStore";
import { getMainDevice } from "../../store/mainDeviceMemoryStore";
import { getOrFetchWebDevice } from "../../store/webDeviceStore";
import { OS } from "../platform/platform";

export const getActiveDevice = async (): Promise<LocalDevice | null> => {
  let device: LocalDevice | null = null;
  if (OS === "web") {
    device = await getOrFetchWebDevice();
  } else if (OS === "ios" || OS === "electron") {
    device = await getDevice();
  }
  if (!device) {
    device = getMainDevice();
  }
  return device;
};
