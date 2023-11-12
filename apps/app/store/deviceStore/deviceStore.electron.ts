import { LocalDevice } from "@serenity-tools/common";
import * as electronInterface from "../../utils/setupElectronInterface/electronInterface.electron";

export const setDevice = async (device: LocalDevice) => {
  return electronInterface.setDevice(device);
};

export const getDevice = async (): Promise<LocalDevice | null> => {
  const device = await electronInterface.getDevice();
  return device;
};

export const removeDevice = async (): Promise<void> => {
  electronInterface.deleteDevice();
};
