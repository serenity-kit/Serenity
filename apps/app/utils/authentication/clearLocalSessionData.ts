import { removeWebDevice } from "../device/webDeviceStore";
import { removeItem } from "../storage/storage";
import { removeLastUsedDocumentId } from "../lastUsedWorkspaceAndDocumentStore/lastUsedWorkspaceAndDocumentStore";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const clearLocalSessionData = async (workspaceId?: string) => {
  await removeWebDevice();
  await removeItem("deviceSigningPublicKey");
  if (workspaceId) {
    removeLastUsedDocumentId(workspaceId);
  }
  await AsyncStorage.clear();
};
