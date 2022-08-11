import { Device } from "../../types/Device";

export type Props = {
  signingPublicKey: string;
  devices: Device[];
};
export const getDeviceBySigningPublicKey = ({
  signingPublicKey,
  devices,
}: Props): Device | undefined => {
  for (const row in devices) {
    const device = devices[row];
    if (device.signingPublicKey === signingPublicKey) {
      return device;
    }
  }
};
