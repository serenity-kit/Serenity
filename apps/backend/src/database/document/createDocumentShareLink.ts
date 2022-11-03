import { ForbiddenError } from "apollo-server-express";
import { DocumentShareLink, Role } from "../../../prisma/generated/output";
import { getOrCreateCreatorDevice } from "../../utils/device/getOrCreateCreatorDevice";
import { prisma } from "../prisma";

export type SnapshotKeyBoxCreateInput = {
  snapshotId: string;
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
  documentId: string;
  sharingRole: Role;
  sharerUserId: string;
  creatorDeviceSigningPublicKey: string;
  snapshotDeviceKeyBoxes: SnapshotDeviceKeyBox[];
};
export const createDocumentShareLink = async ({
  documentId,
  sharingRole,
  sharerUserId,
  creatorDeviceSigningPublicKey,
  snapshotDeviceKeyBoxes,
}: Props): Promise<DocumentShareLink> => {
  // get the document
  const document = await prisma.document.findFirst({
    where: { id: documentId },
  });
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
  return await prisma.$transaction(async (prisma) => {
    // create the device
    const creatorDevice = await getOrCreateCreatorDevice({
      prisma,
      signingPublicKey: creatorDeviceSigningPublicKey,
      userId: sharerUserId,
    });

    const documentShareLink = await prisma.documentShareLink.create({
      data: {
        documentId,
        role: sharingRole,
      },
    });
    // get the latest snapshot and set up the snapshot key boxes
    const latestSnapshot = await prisma.snapshot.findFirst({
      where: { documentId },
      orderBy: { createdAt: "desc" },
    });
    if (!latestSnapshot) {
      throw new Error("No snapshot found");
    }

    const snapshotKeyBoxes: SnapshotKeyBoxCreateInput[] = [];
    for (const snapshotKeyBox of snapshotDeviceKeyBoxes) {
      snapshotKeyBoxes.push({
        snapshotId: latestSnapshot.id,
        ciphertext: snapshotKeyBox.ciphertext,
        nonce: snapshotKeyBox.nonce,
        deviceSigningPublicKey: snapshotKeyBox.deviceSigningPublicKey,
        creatorDeviceSigningPublicKey,
      });
    }
    await prisma.snapshotKeyBox.createMany({
      data: snapshotKeyBoxes,
    });
    return documentShareLink;
  });
};
