import { Platform } from "react-native";
import {
  webDeviceStorageKey,
  webDeviceExpirationStorageKey,
} from "../constants";

export const removeLocalWebDevice = async () => {
  if (Platform.OS === "web") {
    localStorage.removeItem(webDeviceExpirationStorageKey);
    localStorage.removeItem(webDeviceStorageKey);
  }
};
