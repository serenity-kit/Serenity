import { ForbiddenError } from "apollo-server-express";
import { v4 as uuidv4 } from "uuid";
import { Role } from "../../../prisma/generated/output";
import { getOrCreateCreatorDevice } from "../../utils/device/getOrCreateCreatorDevice";
import { prisma } from "../prisma";

type Params = {
  userId: string;
  creatorDeviceSigningPublicKey: string;
  snapshotId: string;
  subkeyId: number;
  contentCiphertext: string;
  contentNonce: string;
};

export async function createComment({
  userId,
  creatorDeviceSigningPublicKey,
  snapshotId,
  subkeyId,
  contentCiphertext,
  contentNonce,
}: Params) {
  // verify the document exists
  const document = await prisma.document.findFirst({
    where: { activeSnapshotId: snapshotId },
  });
  if (!document) {
    throw new ForbiddenError("Unauthorized");
  }
  const allowedRoles = [Role.ADMIN, Role.EDITOR, Role.COMMENTER];
  // verify that the user is an admin or editor, or commentor of the workspace
  const user2Workspace = await prisma.usersToWorkspaces.findFirst({
    where: {
      userId,
      workspaceId: document.workspaceId,
      role: { in: allowedRoles },
    },
  });
  if (!user2Workspace) {
    throw new ForbiddenError("Unauthorized");
  }
  // convert the user's device into a creatorDevice
  const creatorDevice = await getOrCreateCreatorDevice({
    prisma,
    userId,
    signingPublicKey: creatorDeviceSigningPublicKey,
  });

  try {
    const comment = await prisma.comment.create({
      data: {
        id: uuidv4(),
        documentId: document.id,
        snapshotId,
        creatorDeviceSigningPublicKey: creatorDevice.signingPublicKey,
        contentCiphertext,
        contentNonce,
        subkeyId,
      },
    });
    return {
      ...comment,
      creatorDevice,
    };
  } catch (e) {
    console.log(e);
    throw e;
  }
}
