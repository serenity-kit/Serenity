import { prisma } from "../prisma";

type Params = {
  userId: string;
  signingPublicKey: string;
  encryptionPublicKey: string;
  encryptionPublicKeySignature: string;
};

export async function createDevice({
  userId,
  signingPublicKey,
  encryptionPublicKey,
  encryptionPublicKeySignature,
}: Params) {
  try {
    return await prisma.$transaction(async (prisma) => {
      return await prisma.device.create({
        data: {
          signingPublicKey,
          encryptionPublicKey,
          encryptionPublicKeySignature,
          user: { connect: { id: userId } },
        },
      });
    });
  } catch (error) {
    throw error;
  }
}
