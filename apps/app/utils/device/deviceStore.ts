import { Device } from "../../types/Device";
import { getItem, removeItem, setItem } from "../storage/storage";

export const deviceStorageKey = "device.device";

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
