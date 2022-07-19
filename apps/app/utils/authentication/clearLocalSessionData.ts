import AsyncStorage from "@react-native-async-storage/async-storage";
import { removeDevice } from "../device/deviceStore";

export const clearLocalSessionData = async () => {
  await removeDevice();
  // on iOS .clear would throw an exception in case there are no keys in the store
  // https://github.com/react-native-async-storage/async-storage/issues/86#issuecomment-554257281
  const asyncStorageKeys = await AsyncStorage.getAllKeys();
  if (asyncStorageKeys.length > 0) {
    AsyncStorage.clear();
  }
};
