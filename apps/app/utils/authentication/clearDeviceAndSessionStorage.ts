import { Platform } from "react-native";
import { removeDevice } from "../device/deviceStore";
import { removeWebDevice } from "../device/webDeviceStore";
import {
  getLastUsedWorkspaceId,
  removeLastUsedDocumentId,
  removeLastUsedWorkspaceId,
} from "../lastUsedWorkspaceAndDocumentStore/lastUsedWorkspaceAndDocumentStore";
import { deleteSessionKey } from "./sessionKeyStore";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const clearDeviceAndSessionStorage = async () => {
  if (Platform.OS === "web") {
    // on iOS .clear would throw an exception in case there are no keys in the store
    // https://github.com/react-native-async-storage/async-storage/issues/86#issuecomment-554257281
    const asyncStorageKeys = await AsyncStorage.getAllKeys();
    if (asyncStorageKeys.length > 0) {
      AsyncStorage.clear();
    }
  } else {
    const lastUsedWorkspaceId = await getLastUsedWorkspaceId();
    if (lastUsedWorkspaceId) {
      await removeLastUsedDocumentId(lastUsedWorkspaceId);
      await removeLastUsedWorkspaceId();
    }
    await removeDevice();
    await removeWebDevice();
    await deleteSessionKey();
  }
};
