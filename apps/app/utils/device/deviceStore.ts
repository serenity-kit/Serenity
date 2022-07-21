import { Device } from "../../types/Device";
import { getItem, setItem, removeItem } from "../storage/storage";
import { createDevice } from "@serenity-tools/common";
import { Platform } from "react-native";

export const deviceStorageKey = "device.device";

let device: Device | null = null;

export const createAndSetDevice = async (): Promise<Device | null> => {
  const device = await createDevice();
  await setDevice(device);
  return device;
};

export const setDevice = async (device: Device) => {
  await setItem(deviceStorageKey, JSON.stringify(device));
};

export const getDevice = async (): Promise<Device | null> => {
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
};

export const removeDevice = async (): Promise<void> => {
  await removeItem(deviceStorageKey);
};
