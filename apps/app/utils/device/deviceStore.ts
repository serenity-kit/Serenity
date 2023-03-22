import { LocalDevice } from "@serenity-tools/common";
import * as SecureStore from "expo-secure-store";

export const deviceStorageKey = "device.device";

export const setDevice = async (device: LocalDevice) => {
  await SecureStore.setItemAsync(deviceStorageKey, JSON.stringify(device));
};

export const getDevice = async (): Promise<LocalDevice | null> => {
  const jsonDevice = await SecureStore.getItemAsync(deviceStorageKey);
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
  await SecureStore.deleteItemAsync(deviceStorageKey);
};
