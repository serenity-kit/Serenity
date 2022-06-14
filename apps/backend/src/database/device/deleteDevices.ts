import { prisma } from "../prisma";

type Params = {
  userId: string;
  signingPublicKeys: string[];
};

export async function deleteDevices({
  userId,
  signingPublicKeys,
}: Params): Promise<void> {
  return await prisma.$transaction(async (prisma) => {
    /*
    console.log({ userId, signingPublicKeys });
    // TODO: force the user to sign the keys?
    // find all devices in the list that match a userID
    const validDevices = await prisma.device.findMany({
      where: {
        signingPublicKey: { in: signingPublicKeys },
        userId,
      },
    });
    console.log({ validDevices });
    // create a list of valid device ids to delete
    const validDeviceSigningPublicKeys: string[] = [];
    validDevices.forEach((device) => {
      if (device.userId === userId) {
        validDeviceSigningPublicKeys.push(device.signingPublicKey);
      }
    });
    console.log({ validDeviceSigningPublicKeys });
    // FIXME: it's possible that we don't need the previous two steps
    /* */
    await prisma.device.deleteMany({
      where: {
        signingPublicKey: {
          in: signingPublicKeys,
        },
        userId,
      },
    });
    return;
  });
}
