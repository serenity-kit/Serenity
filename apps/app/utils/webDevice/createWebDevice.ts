import { Platform } from "react-native";
import { createDevice } from "@serenity-tools/common";
import {
  webDeviceStorageKey,
  webDeviceExpirationStorageKey,
  webDeviceExpirationSeconds,
} from "../constants";

export const createWebDevice = async () => {
  const expirationExpireTime =
    new Date().getTime() + webDeviceExpirationSeconds;
  const expiration = new Date(expirationExpireTime);
  const webDevice = await createDevice();
  if (Platform.OS === "web") {
    localStorage.setItem(
      webDeviceExpirationStorageKey,
      expiration.toISOString()
    );
    localStorage.setItem(webDeviceStorageKey, JSON.stringify(webDevice));
  }
  return webDevice;
};
