import AsyncStorage from "@react-native-async-storage/async-storage";

export const getItem = async (key: string): Promise<string | null> => {
  return AsyncStorage.getItem(key);
};

export const removeItem = async (key: string): Promise<void> => {
  return AsyncStorage.removeItem(key);
};

export const setItem = async (key: string, value: string): Promise<void> => {
  return AsyncStorage.setItem(key, value);
};
