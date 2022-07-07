import { Device } from "../../types/Device";
import { getItemAsync, setItemAsync, deleteItemAsync } from "expo-secure-store";
import { createDevice } from "@serenity-tools/common";

export const deviceStorageKey = "device.device";

let device: Device | null = null;

export const createAndSetDevice = async () => {
  const device = await createDevice();
  await setDevice(device);
  return device;
};

export const setDevice = async (device: Device) => {
  await setItemAsync(deviceStorageKey, JSON.stringify(device));
};

export const getDevice = async (): Promise<Device | null> => {
  const jsonDevice = await getItemAsync(deviceStorageKey);
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

export const removeDevice = async () => {
  await deleteItemAsync(deviceStorageKey);
};
