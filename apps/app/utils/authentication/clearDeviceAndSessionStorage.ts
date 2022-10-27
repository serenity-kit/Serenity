import { Platform } from "react-native";
import { removeDevice } from "../device/deviceStore";
import { removeWebDevice } from "../device/webDeviceStore";
import { deleteSessionKey } from "./sessionKeyStore";

export const clearDeviceAndSessionStorage = async (
  clearWorkspaceKeyStore: () => void
) => {
  if (Platform.OS === "web") {
    await removeWebDevice();
  } else if (Platform.OS === "ios") {
    await removeDevice();
  }
  await deleteSessionKey();
  if (clearWorkspaceKeyStore) {
    clearWorkspaceKeyStore();
  }
  // NOTE: don't remove last login or last used workspaceID/documentID for last login
};
