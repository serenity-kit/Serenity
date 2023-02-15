import { KeyDerivationTrace2 } from "@naisho/core";
import { ForbiddenError } from "apollo-server-express";
import { v4 as uuidv4 } from "uuid";
import { Role } from "../../../prisma/generated/output";
import { getOrCreateCreatorDevice } from "../../utils/device/getOrCreateCreatorDevice";
import { prisma } from "../prisma";

type Params = {
  userId: string;
  creatorDeviceSigningPublicKey: string;
  documentId: string;
  contentCiphertext: string;
  contentNonce: string;
  keyDerivationTrace: KeyDerivationTrace2;
};

export async function createComment({
  userId,
  creatorDeviceSigningPublicKey,
  documentId,
  contentCiphertext,
  contentNonce,
  keyDerivationTrace,
}: Params) {
  // verify the document exists
  const document = await prisma.document.findFirst({
    where: { id: documentId },
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
        documentId,
        creatorDeviceSigningPublicKey: creatorDevice.signingPublicKey,
        contentCiphertext,
        contentNonce,
        keyDerivationTrace,
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
