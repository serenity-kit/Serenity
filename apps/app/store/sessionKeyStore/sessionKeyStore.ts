import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { OS } from "../../utils/platform/platform";

export const sessionKeyStorageKey = "sessionKey";

export const setSessionKey = async (sessionKey: string) => {
  if (OS === "web") {
    return AsyncStorage.setItem(sessionKeyStorageKey, sessionKey);
  } else {
    return SecureStore.setItemAsync(sessionKeyStorageKey, sessionKey);
  }
};

export const getSessionKey = async (): Promise<string | null> => {
  if (OS === "web") {
    return AsyncStorage.getItem(sessionKeyStorageKey);
  } else {
    return SecureStore.getItemAsync(sessionKeyStorageKey);
  }
};

export const deleteSessionKey = async () => {
  if (OS === "web") {
    return AsyncStorage.removeItem(sessionKeyStorageKey);
  } else {
    return SecureStore.deleteItemAsync(sessionKeyStorageKey);
  }
};
