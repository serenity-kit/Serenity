import { Device } from "../../types/Device";

export type Props = {
  signingPublicKey: string;
  devices: Device[];
};
export const getLocalDeviceBySigningPublicKey = ({
  signingPublicKey,
  devices,
}: Props): Device => {
  for (const row in devices) {
    const device = devices[row];
    if (device.signingPublicKey === signingPublicKey) {
      return device;
    }
  }
  throw new Error("Could not find matching device");
};
