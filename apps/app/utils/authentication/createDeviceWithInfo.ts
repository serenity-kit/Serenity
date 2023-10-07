import { createDevice, LocalDevice } from "@serenity-tools/common";
import { detect } from "detect-browser";
import { Platform } from "react-native";

export const createDeviceWithInfo = () => {
  let device: LocalDevice = createDevice("user");
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
