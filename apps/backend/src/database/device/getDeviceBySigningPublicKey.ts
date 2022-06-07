import { prisma } from "../prisma";

type Params = {
  userId: string;
  signingPublicKey: string;
};

type DeviceBySigningPublicKeyResponse = {
  signingPublicKey: string;
  encryptionPublicKey: string;
  encryptionKeyType: string;
  encryptionPublicKeySignature: string;
};

export async function getDeviceBySigningPublicKey({
  userId,
  signingPublicKey,
}: Params): Promise<DeviceBySigningPublicKeyResponse> {
  // TODO: force the user to sign the keys?
  const device = await prisma.device.findFirst({
    where: {
      signingPublicKey,
      userId,
    },
  });
  if (!device) {
    throw new Error("Device not found");
  }
  return device;
}
