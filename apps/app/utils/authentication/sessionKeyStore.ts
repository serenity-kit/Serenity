import * as storage from "../storage/storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const sessionKeyStorageKey = "sessionKey";

export const setSessionKey = async (sessionKey: string) => {
  if (Platform.OS == "ios") {
    await SecureStore.setItemAsync(sessionKeyStorageKey, sessionKey);
  } else {
    await storage.setItem(sessionKeyStorageKey, sessionKey);
  }
};

export const getSessionKey = async (): Promise<string | null> => {
  let sessionKey: string | null | undefined;
  if (Platform.OS == "ios") {
    sessionKey = await SecureStore.getItemAsync(sessionKeyStorageKey);
  } else {
    sessionKey = await storage.getItem(sessionKeyStorageKey);
  }
  return sessionKey;
};

export const deleteSessionKey = async () => {
  if (Platform.OS == "ios") {
    await SecureStore.deleteItemAsync(sessionKeyStorageKey);
  } else {
    await storage.removeItem(sessionKeyStorageKey);
  }
};
