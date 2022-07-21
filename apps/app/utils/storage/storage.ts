import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export const getItem = async (key: string): Promise<string | null> => {
  if (Platform.OS === "web") {
    return AsyncStorage.getItem(key);
  } else {
    return SecureStore.getItemAsync(key);
  }
};

export const removeItem = async (key: string): Promise<void> => {
  if (Platform.OS === "web") {
    return AsyncStorage.removeItem(key);
  } else {
    return SecureStore.deleteItemAsync(key);
  }
};

export const setItem = async (key: string, value: string): Promise<void> => {
  if (Platform.OS === "web") {
    return AsyncStorage.setItem(key, value);
  } else {
    return SecureStore.setItemAsync(key, value);
  }
};
