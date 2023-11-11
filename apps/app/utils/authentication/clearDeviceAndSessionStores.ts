import { removeDevice } from "../../store/deviceStore/deviceStore";
import { deleteSessionKey } from "../../store/sessionKeyStore/sessionKeyStore";
import { removeWebDeviceAccess } from "../../store/webDeviceStore";
import { OS } from "../platform/platform";

export const clearDeviceAndSessionStores = async () => {
  if (OS === "web") {
    await removeWebDeviceAccess();
  } else if (OS === "ios" || OS === "electron") {
    await removeDevice();
  }
  await deleteSessionKey();
  // NOTE: don't remove last login or last used workspaceID/documentID for last login
};
