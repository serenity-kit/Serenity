import { LocalDevice } from "@serenity-tools/common";
import { getDevice } from "../../store/deviceStore/deviceStore";
import { getMainDevice } from "../../store/mainDeviceMemoryStore";
import { fetchWebDevice, getLocalWebDevice } from "../../store/webDeviceStore";
import { OS } from "../platform/platform";

export const getActiveDevice = async (
  onlyLocal: boolean = false
): Promise<LocalDevice | null> => {
  let device: LocalDevice | null = null;
  if (OS === "web") {
    if (onlyLocal) {
      device = getLocalWebDevice();
    } else {
      const webDeviceData = await fetchWebDevice();
      device = webDeviceData?.device ?? null;
    }
  } else if (OS === "ios" || OS === "electron") {
    device = await getDevice();
  }
  if (!device) {
    device = getMainDevice();
  }
  return device;
};
