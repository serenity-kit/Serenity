import { Device } from "../../types/Device";
import { getItem, setItem, removeItem } from "../storage/storage";
import { createDevice } from "@serenity-tools/common";
import { Platform } from "react-native";

export const deviceStorageKey = "device.device";

let device: Device | null = null;

export const createAndSetDevice = async (): Promise<Device | null> => {
  if (Platform.OS === "ios") {
    const device = await createDevice();
    await setDevice(device);
    return device;
  }
  return null;
};

export const setDevice = async (device: Device) => {
  if (Platform.OS === "ios") {
    await setItem(deviceStorageKey, JSON.stringify(device));
  }
};

export const getDevice = async (): Promise<Device | null> => {
  if (Platform.OS === "ios") {
    const jsonDevice = await getItem(deviceStorageKey);
    if (!jsonDevice) {
      return null;
    }
    try {
      const device = JSON.parse(jsonDevice);
      return device;
    } catch (error) {
      await removeDevice();
      return null;
    }
  }
  return null;
};

export const removeDevice = async () => {
  if (Platform.OS === "ios") {
    await removeItem(deviceStorageKey);
  }
};
