import { Device } from "../../../prisma/generated/output";

export type DeviceWithUserId = Device & {
  userId: string;
};

export function isDeviceWithUserId(device: Device): device is DeviceWithUserId {
  return device.userId !== undefined;
}
