import AsyncStorage from "@react-native-async-storage/async-storage";

export const clearLocalSessionData = async () => {
  await AsyncStorage.clear();
};
