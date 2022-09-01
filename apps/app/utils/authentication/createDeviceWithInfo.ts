import { createDevice, LocalDevice } from "@serenity-tools/common";
import { detect } from "detect-browser";
import { Platform } from "react-native";

export type LocalDeviceInclInfo = LocalDevice & { info?: string };

export const createDeviceWithInfo = async () => {
  let device: LocalDeviceInclInfo = await createDevice();
  const browser = detect();
  if (Platform.OS === "web") {
    const deviceInfoJson = {
      type: "web",
      os: browser?.os,
      osVersion: null,
      browser: browser?.name,
      browserVersion: browser?.version,
    };
    const deviceInfo = JSON.stringify(deviceInfoJson);
    device.info = deviceInfo;
  } else if (Platform.OS === "ios") {
    const deviceInfoJson = {
      type: "device",
      os: Platform.OS,
      osVersion: Platform.Version,
      browser: null,
      browserVersion: null,
    };
    const deviceInfo = JSON.stringify(deviceInfoJson);
    device.info = deviceInfo;
  }
  return device;
};
