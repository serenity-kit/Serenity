import { prisma } from "../prisma";

type Params = {
  userId: string;
  signingPublicKey: string;
  encryptionPublicKey: string;
  encryptionPublicKeySignature: string;
  info: string;
};

export async function createDevice({
  userId,
  signingPublicKey,
  encryptionPublicKey,
  encryptionPublicKeySignature,
  info,
}: Params) {
  try {
    return await prisma.$transaction(async (prisma) => {
      return await prisma.device.create({
        data: {
          signingPublicKey,
          encryptionPublicKey,
          encryptionPublicKeySignature,
          info,
          user: { connect: { id: userId } },
        },
      });
    });
  } catch (error) {
    throw error;
  }
}
