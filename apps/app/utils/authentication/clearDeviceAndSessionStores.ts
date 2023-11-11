import { Platform } from "react-native";
import { removeDevice } from "../../store/deviceStore/deviceStore";
import { deleteSessionKey } from "../../store/sessionKeyStore/sessionKeyStore";
import { removeWebDeviceAccess } from "../../store/webDeviceStore";

export const clearDeviceAndSessionStores = async () => {
  if (Platform.OS === "web") {
    await removeWebDeviceAccess();
  } else if (Platform.OS === "ios") {
    await removeDevice();
  }
  await deleteSessionKey();
  // NOTE: don't remove last login or last used workspaceID/documentID for last login
};
