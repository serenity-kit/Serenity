import { Snapshot } from "@naisho/core";
import { ForbiddenError } from "apollo-server-express";
import { Role } from "../../../prisma/generated/output";
import { createSnapshot } from "../createSnapshot";
import { prisma } from "../prisma";

type Params = {
  userId: string;
  id: string;
  nameCiphertext?: string | null;
  nameNonce?: string | null;
  workspaceKeyId?: string | null;
  subkeyId?: number | null;
  parentFolderId: string;
  workspaceId: string;
  snapshot: Snapshot;
};

export async function createDocument({
  userId,
  id,
  nameCiphertext,
  nameNonce,
  workspaceKeyId,
  subkeyId,
  parentFolderId,
  workspaceId,
  snapshot,
}: Params) {
  const allowedRoles = [Role.ADMIN, Role.EDITOR];
  // verify that the user is an admin or editor of the workspace
  const user2Workspace = await prisma.usersToWorkspaces.findFirst({
    where: { userId, workspaceId, role: { in: allowedRoles } },
  });
  if (!user2Workspace) {
    throw new ForbiddenError("Unauthorized");
  }
  const document = await prisma.document.create({
    data: {
      id,
      nameCiphertext,
      nameNonce,
      workspaceKeyId,
      subkeyId,
      parentFolderId,
      workspaceId,
    },
  });
  if (document) {
    await createSnapshot({
      snapshot,
      workspaceId: document.workspaceId,
    });
  }
  return document;
}
