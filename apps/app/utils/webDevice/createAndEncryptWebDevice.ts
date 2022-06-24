import { Platform } from "react-native";
import { createAndEncryptDevice } from "@serenity-tools/common";

export const createAndEncryptWebDevice = async (exportKey: string) => {
  const thirdayDaysFromNow = new Date().getTime() + 1000 * 60 * 60 * 24 * 30;
  const expiration = new Date(thirdayDaysFromNow);
  const webDevice = await createAndEncryptDevice(exportKey);
  const webDeviceStorageKey = "webDevice";
  const webDeviceExpirationStorageKey = "webDeviceExpiration";
  if (Platform.OS === "web") {
    localStorage.setItem(
      webDeviceExpirationStorageKey,
      expiration.toISOString()
    );
    localStorage.setItem(webDeviceStorageKey, JSON.stringify(webDevice));
  }
  return webDevice;
};
