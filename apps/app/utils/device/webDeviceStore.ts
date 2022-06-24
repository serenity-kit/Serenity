import { Device } from "../../types/Device";
import { getItem, setItem, removeItem } from "../storage/storage";
import { createDevice } from "@serenity-tools/common";

export const webDeviceStorageKey = "webDevice.device";
export const webDeviceExpirationStorageKey = "webDevice.expiration";
export const webDeviceExpirationSeconds = 1000 * 60 * 60 * 24 * 30;

let device: Device | null = null;

export const createWebDevice = async () => {
  const webDevice = await createDevice();
  await setWebDevice(webDevice);
  return webDevice;
};

export const setWebDevice = async (newDevice: Device) => {
  const expirationExpireTime =
    new Date().getTime() + webDeviceExpirationSeconds;
  const expiration = new Date(expirationExpireTime);
  await setItem(webDeviceExpirationStorageKey, expiration.toISOString());
  await setItem(webDeviceStorageKey, JSON.stringify(newDevice));
};

export const getWebDevice = async (): Promise<Device | null> => {
  const isoExpirationDate = await getItem(webDeviceExpirationStorageKey);
  if (!isoExpirationDate) {
    await removeWebDevice();
    return null;
  }
  const expirationDate = new Date(isoExpirationDate);
  const currentDate = new Date();
  if (expirationDate <= currentDate) {
    await removeWebDevice();
    return null;
  }
  const jsonWebDevice = await getItem(webDeviceStorageKey);
  if (!jsonWebDevice) {
    return null;
  }
  try {
    const webDevice = JSON.parse(jsonWebDevice);
    return webDevice;
  } catch (error) {
    await removeWebDevice();
    return null;
  }
};

export const removeWebDevice = async () => {
  await removeItem(webDeviceStorageKey);
  await removeItem(webDeviceExpirationStorageKey);
};
