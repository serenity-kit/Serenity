import { Device } from "../../types/Device";

let device: Device | null = null;

export const setMainDevice = (newDevice: Device) => {
  device = newDevice;
};

export const getMainDevice = (): Device | null => {
  return device;
};
