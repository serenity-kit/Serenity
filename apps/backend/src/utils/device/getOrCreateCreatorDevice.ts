import { UserInputError } from "apollo-server-express";
import { Prisma } from "../../../prisma/generated/output";
import { CreatorDevice } from "../../types/device";

export type Props = {
  userId: string;
  prisma: Prisma.TransactionClient;
  signingPublicKey: string;
};
export const getOrCreateCreatorDevice = async ({
  prisma,
  userId,
  signingPublicKey,
}: Props): Promise<CreatorDevice> => {
  const deviceUsedToCreate = await prisma.device.findFirst({
    where: { userId, signingPublicKey },
  });
  if (!deviceUsedToCreate) {
    throw new UserInputError("Invalid creatorDeviceSigningPublicKey");
  }
  // create new creatorDevices if necessary
  let creatorDevice = await prisma.creatorDevice.findFirst({
    where: { signingPublicKey },
  });
  if (!creatorDevice) {
    creatorDevice = await prisma.creatorDevice.create({
      data: {
        signingPublicKey: deviceUsedToCreate.signingPublicKey,
        encryptionPublicKey: deviceUsedToCreate.encryptionPublicKey,
        encryptionPublicKeySignature:
          deviceUsedToCreate.encryptionPublicKeySignature,
        createdAt: deviceUsedToCreate.createdAt,
      },
    });
  }
  return creatorDevice;
};

/*

const existingCreatorDevices = await prisma.creatorDevice.findMany({
    where: { signingPublicKey: { in: creatorDeviceSigningPublicKeys } },
  });
  const existingCreatorSigningPublicKeys: string[] = [];
  existingCreatorDevices.forEach((creatorDevice) => {
    existingCreatorSigningPublicKeys.push(creatorDevice.signingPublicKey);
  });
  // retrieve devices that aren't yet "creators"
  const devices = await prisma.device.findMany({
    where: {
      signingPublicKey: {
        in: creatorDeviceSigningPublicKeys,
        notIn: existingCreatorSigningPublicKeys,
      },
    },
  });
  const creatorDevicData: CreatorDevice[] = [];
  devices.forEach((device) => {
    if (device.userId !== userId) {
      throw new UserInputError("Invalid creatorDeviceSigningPublicKey");
    }
    creatorDevicData.push({
      ...device,
    });
  });
  await prisma.creatorDevice.createMany({
    data: creatorDevicData,
  });
  const creatorDevices = await prisma.creatorDevice.findMany({
    where: { signingPublicKey: { in: creatorDeviceSigningPublicKeys } },
  });
  const creatorDeviceLookup: { [signingPublicKey: string]: CreatorDevice } =
    {};
  creatorDevices.forEach((creatorDevice) => {
    creatorDeviceLookup[creatorDevice.signingPublicKey] = creatorDevice;
  });
  */
