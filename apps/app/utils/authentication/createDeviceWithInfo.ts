import { createDevice, LocalDevice } from "@serenity-tools/common";
import { detect } from "detect-browser";
import { Platform } from "react-native";
import { OS } from "../platform/platform";

export const createDeviceWithInfo = () => {
  let device: LocalDevice = createDevice("user");
  const browser = detect();
  if (OS === "web") {
    const deviceInfoJson = {
      type: "web",
      os: browser?.os,
      osVersion: null,
      browser: browser?.name,
      browserVersion: browser?.version,
    };
    const deviceInfo = JSON.stringify(deviceInfoJson);
    device.info = deviceInfo;
  } else if (OS === "ios") {
    const deviceInfoJson = {
      type: "device",
      os: Platform.OS,
      osVersion: Platform.Version,
      browser: null,
      browserVersion: null,
    };
    const deviceInfo = JSON.stringify(deviceInfoJson);
    device.info = deviceInfo;
  } else if (OS === "electron") {
    const deviceInfoJson = {
      type: "device",
      os: "Desktop", // TODO: get OS
      osVersion: Platform.Version,
      browser: null,
      browserVersion: null,
    };
    const deviceInfo = JSON.stringify(deviceInfoJson);
    device.info = deviceInfo;
  }
  return device;
};
