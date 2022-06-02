import { Platform } from "react-native";

const storage: { [key: string]: string } = {};

export const getItem = (key: string): string | null => {
  if (Platform.OS === "web") {
    return localStorage.getItem(key);
  }
  return storage[key] || null;
};

export const removeItem = (key: string): void => {
  if (Platform.OS === "web") {
    localStorage.removeItem(key);
  }
  delete storage[key];
};

export const setItem = (key: string, value: string): void => {
  if (Platform.OS === "web") {
    localStorage.setItem(key, value);
  }
  storage[key] = value;
};
