import { ForbiddenError } from "apollo-server-express";
import { Role } from "../../../prisma/generated/output";
import { KeyDerivationTrace } from "../../types/folder";
import { prisma } from "../prisma";

type Params = {
  userId: string;
  id: string;
  encryptedName?: string | null;
  encryptedNameNonce?: string | null;
  workspaceKeyId?: string | null;
  subkeyId?: number | null;
  parentFolderId?: string | null;
  workspaceId: string;
  nameKeyDerivationTrace: KeyDerivationTrace;
};

export async function createDocument({
  userId,
  id,
  encryptedName,
  encryptedNameNonce,
  workspaceKeyId,
  subkeyId,
  parentFolderId,
  workspaceId,
  nameKeyDerivationTrace,
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
      encryptedName,
      encryptedNameNonce,
      workspaceKeyId,
      subkeyId,
      parentFolderId,
      workspaceId,
      nameKeyDerivationTrace,
    },
  });
  return document;
}
