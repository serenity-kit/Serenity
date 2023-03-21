import { LocalDevice } from "@serenity-tools/common";

let device: LocalDevice | null = null;

export const setMainDevice = (newDevice: LocalDevice) => {
  device = newDevice;
};

export const getMainDevice = (): LocalDevice | null => {
  return device;
};
