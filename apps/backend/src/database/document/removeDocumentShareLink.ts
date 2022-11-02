import { ForbiddenError, UserInputError } from "apollo-server-express";
import { Role } from "../../../prisma/generated/output";
import { getOrCreateCreatorDevice } from "../../utils/device/getOrCreateCreatorDevice";
import { prisma } from "../prisma";

export type SnapshotKeyBoxCreateInput = {
  snapshotKeyId: string;
  deviceSigningPublicKey: string;
  creatorDeviceSigningPublicKey: string;
  nonce?: string;
  ciphertext: string;
};

export type SnapshotDeviceKeyBox = {
  ciphertext: string;
  nonce: string;
  deviceSigningPublicKey: string;
};

export type Props = {
  token: string;
  sharerUserId: string;
  deviceSigningPublicKey: string;
  snapshotDeviceKeyBoxes: SnapshotDeviceKeyBox[];
};
export const removeDocumentShareLink = async ({
  token,
  sharerUserId,
  deviceSigningPublicKey,
  snapshotDeviceKeyBoxes,
}: Props) => {
  return await prisma.$transaction(async (prisma) => {
    const documentShareLink = await prisma.documentShareLink.findFirst({
      where: { token },
    });
    if (!documentShareLink) {
      throw new UserInputError("Invalid token");
    }
    const documentId = documentShareLink.documentId;
    const document = await prisma.document.findFirst({
      where: { id: documentId },
    });
    console.log({ document });
    if (!document) {
      throw new ForbiddenError("Unauthorized");
    }
    const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
      where: {
        workspaceId: document.workspaceId,
        userId: sharerUserId,
        role: { in: [Role.ADMIN, Role.EDITOR] },
      },
    });
    if (!userToWorkspace) {
      throw new ForbiddenError("Unauthorized");
    }
    const creatorDevice = await getOrCreateCreatorDevice({
      prisma,
      userId: sharerUserId,
      signingPublicKey: deviceSigningPublicKey,
    });

    await prisma.documentShareLink.delete({
      where: { token },
    });

    const latestSnapshot = await prisma.snapshot.findFirst({
      where: { documentId },
      orderBy: { createdAt: "desc" },
    });
    if (!latestSnapshot) {
      throw new Error("No snapshot found");
    }
    let latestSnapshotKey = await prisma.snapshotKey.findFirst({
      where: { snapshotId: latestSnapshot?.id },
      orderBy: { generation: "desc" },
    });
    let snapshotKeyId = "";
    if (!latestSnapshotKey) {
      latestSnapshotKey = await prisma.snapshotKey.create({
        data: {
          generation: 0,
          snapshotId: latestSnapshot.id,
        },
      });
    }
    snapshotKeyId = latestSnapshotKey.id;

    const snapshotKeyBoxes: SnapshotKeyBoxCreateInput[] = [];
    for (const snapshotKeyBox of snapshotDeviceKeyBoxes) {
      snapshotKeyBoxes.push({
        snapshotKeyId,
        ciphertext: snapshotKeyBox.ciphertext,
        nonce: snapshotKeyBox.nonce,
        deviceSigningPublicKey: snapshotKeyBox.deviceSigningPublicKey,
        creatorDeviceSigningPublicKey: creatorDevice.signingPublicKey,
      });
    }
    const numCreateMany = await prisma.snapshotKeyBox.createMany({
      data: snapshotKeyBoxes,
    });
  });
};
