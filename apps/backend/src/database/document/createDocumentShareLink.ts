// create a device and that is encrypted with a secret bo

import { ForbiddenError } from "apollo-server-express";
import { DocumentShareLink, Role } from "../../../prisma/generated/output";
import { prisma } from "../prisma";

// inputs are:
// documentId: string
// deviceSecretBoxCipherTex: string;
// deviceSecretBoxNonce: string;
// device: { signingPublicKey, encryptionPublicKey, encryptionPublickeySignature }

// return device from database

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
  documentId: string;
  sharingRole: Role;
  sharerUserId: string;
  deviceSecretBoxCiphertext: string;
  deviceSecretBoxNonce: string;
  deviceSigningPublicKey: string;
  deviceEncryptionPublicKey: string;
  deviceEncryptionPublicKeySignature: string;
  snapshotDeviceKeyBoxes: SnapshotDeviceKeyBox[];
};
export const createDocumentShareLink = async ({
  documentId,
  sharingRole,
  sharerUserId,
  deviceSecretBoxCiphertext,
  deviceSecretBoxNonce,
  deviceSigningPublicKey,
  deviceEncryptionPublicKey,
  deviceEncryptionPublicKeySignature,
  snapshotDeviceKeyBoxes,
}: Props): Promise<DocumentShareLink> => {
  // get the document
  const document = await prisma.document.findFirst({
    where: { id: documentId },
  });
  if (!document) {
    throw new ForbiddenError("Unauthorized");
  }
  // make sure the user has access to the document
  // by checking if they have a connection in the
  // userToWorkspace, where the document.workspaceId matches
  // the userToWorkspace.workspaceId
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
    const creatorDevice = await prisma.creatorDevice.create({
      data: {
        signingPublicKey: deviceSigningPublicKey,
        encryptionPublicKey: deviceEncryptionPublicKey,
        encryptionPublicKeySignature: deviceEncryptionPublicKeySignature,
        user: {
          connect: {
            id: sharerUserId,
          },
        },
      },
    });

    const documentShareLink = await prisma.documentShareLink.create({
      data: {
        documentId,
        role: sharingRole,
        deviceSecretBoxCiphertext,
        deviceSecretBoxNonce,
        creatorDeviceSigningPublicKey: creatorDevice.signingPublicKey,
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
    await prisma.snapshotKeyBox.createMany({
      data: snapshotKeyBoxes,
    });
    return documentShareLink;
  });
};
