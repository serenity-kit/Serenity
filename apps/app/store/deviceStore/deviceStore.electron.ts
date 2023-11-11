import { LocalDevice } from "@serenity-tools/common";
import * as electronInterface from "../../utils/setupElectronInterface/setupElectronInterface.electron";

export const setDevice = async (device: LocalDevice) => {
  return electronInterface.setDevice(device);
};

export const getDevice = async (): Promise<LocalDevice | null> => {
  return electronInterface.getDevice();
};

export const removeDevice = async (): Promise<void> => {
  electronInterface.deleteDevice();
};
