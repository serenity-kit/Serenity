import { Snapshot } from "@naisho/core";
import { ForbiddenError, UserInputError } from "apollo-server-express";
import { Role } from "../../../prisma/generated/output";
import { KeyDerivationTrace } from "../../types/folder";
import { getOrCreateCreatorDevice } from "../../utils/device/getOrCreateCreatorDevice";
import { prisma } from "../prisma";

export type SnapshotKeyBoxCreateInput = {
  snapshotId: string;
  deviceSigningPublicKey: string;
  creatorDeviceSigningPublicKey: string;
  nonce: string;
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
  snapshot: Snapshot;
  snapshotDeviceKeyBoxes: SnapshotDeviceKeyBox[];
};
export const removeDocumentShareLink = async ({
  token,
  sharerUserId,
  deviceSigningPublicKey,
  snapshot,
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

    // create a new snapshot
    const newSnapshot = await prisma.snapshot.create({
      data: {
        // id: snapshot.publicData.snapshotId,
        latestVersion: 0,
        preview: "",
        data: JSON.stringify(snapshot),
        activeSnapshotDocument: {
          connect: { id: snapshot.publicData.docId },
        },
        document: { connect: { id: snapshot.publicData.docId } },
        keyDerivationTrace: snapshot.keyDerivationTrace! as KeyDerivationTrace,
        clocks: {},
      },
    });

    const snapshotKeyBoxes: SnapshotKeyBoxCreateInput[] = [];
    for (const snapshotKeyBox of snapshotDeviceKeyBoxes) {
      snapshotKeyBoxes.push({
        snapshotId: newSnapshot.id,
        ciphertext: snapshotKeyBox.ciphertext,
        nonce: snapshotKeyBox.nonce,
        deviceSigningPublicKey: snapshotKeyBox.deviceSigningPublicKey,
        creatorDeviceSigningPublicKey: creatorDevice.signingPublicKey,
      });
    }
    await prisma.snapshotKeyBox.createMany({
      data: snapshotKeyBoxes,
    });
    return newSnapshot;
  });
};
