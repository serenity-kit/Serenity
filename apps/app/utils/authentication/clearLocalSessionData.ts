import AsyncStorage from "@react-native-async-storage/async-storage";
import { removeDevice } from "../device/deviceStore";

export const clearLocalSessionData = async () => {
  await AsyncStorage.clear();
  await removeDevice();
};
