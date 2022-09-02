import { Device } from "../../types/Device";
import { getItem, removeItem, setItem } from "../storage/storage";

export const webDeviceStorageKey = "webDevice.device";
export const webDeviceExpirationStorageKey = "webDevice.expiration";
export const webDeviceExpirationSeconds = 1000 * 60 * 60 * 24 * 30;

export const setWebDevice = async (
  newDevice: Device,
  useExtendedLogin: boolean
) => {
  const expirationExpireTime =
    new Date().getTime() + webDeviceExpirationSeconds;
  const expiration = new Date(expirationExpireTime);
  if (useExtendedLogin) {
    await setItem(webDeviceExpirationStorageKey, expiration.toISOString());
    await setItem(webDeviceStorageKey, JSON.stringify(newDevice));
  } else {
    sessionStorage.setItem(
      webDeviceExpirationStorageKey,
      expiration.toISOString()
    );
    sessionStorage.setItem(webDeviceStorageKey, JSON.stringify(newDevice));
  }
};

export const getWebDevice = async (): Promise<Device | null> => {
  let isoExpirationDate = sessionStorage.getItem(webDeviceExpirationStorageKey);
  let jsonWebDevice = sessionStorage.getItem(webDeviceStorageKey);
  if (!isoExpirationDate) {
    isoExpirationDate = await getItem(webDeviceExpirationStorageKey);
  }
  if (!jsonWebDevice) {
    jsonWebDevice = await getItem(webDeviceStorageKey);
  }
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
  sessionStorage.removeItem(webDeviceStorageKey);
  sessionStorage.removeItem(webDeviceExpirationStorageKey);
};
