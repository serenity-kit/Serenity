import { removeDevice } from "../device/deviceStore";
import { removeWebDevice } from "../device/webDeviceStore";
import {
  getLastUsedWorkspaceId,
  removeLastUsedDocumentIdAndWorkspaceId,
} from "../lastUsedWorkspaceAndDocumentStore/lastUsedWorkspaceAndDocumentStore";
import { deleteSessionKey } from "./sessionKeyStore";

export const clearDeviceAndSessionStorage = async () => {
  await removeLastUsedDocumentIdAndWorkspaceId();
  await removeDevice();
  await removeWebDevice();
  await deleteSessionKey();
  // NOTE: don't remove last login
};
