import { ForbiddenError } from "apollo-server-express";
import { WorkspaceKey } from "../../../prisma/generated/output";
import { prisma } from "../prisma";

export type Props = {
  userId: string;
  workspaceId: string;
  deviceSigningPublicKey: string;
};
export const getActiveWorkspaceKeys = async ({
  userId,
  workspaceId,
  deviceSigningPublicKey,
}: Props): Promise<WorkspaceKey[]> => {
  const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
    where: { userId, workspaceId },
  });
  if (!userToWorkspace) {
    throw new ForbiddenError("Unauthorized");
  }
  // get all workspaceKey ids referenced documents and folders
  // in this workspace
  const workspaceKeyIds: string[] = [];
  const documents = await prisma.document.findMany({
    where: { workspaceId },
    select: { workspaceKeyId: true },
  });
  documents.forEach((document) => {
    if (document.workspaceKeyId) {
      workspaceKeyIds.push(document.workspaceKeyId);
    }
  });
  const folders = await prisma.folder.findMany({
    where: { workspaceId },
    select: { workspaceKeyId: true },
  });
  folders.forEach((folder) => {
    workspaceKeyIds.push(folder.workspaceKeyId);
  });

  // get all workspaceKeys associated with a workspace;
  const earliestWorkspaceKeyGeneration = await prisma.workspaceKey.findFirst({
    where: { workspaceId, id: { in: workspaceKeyIds } },
    select: { generation: true },
    orderBy: { generation: "asc" },
  });
  if (!earliestWorkspaceKeyGeneration) {
    throw new Error("No workspace keys found");
  }
  const earliestGeneration = earliestWorkspaceKeyGeneration.generation;
  const workspaceKeys = await prisma.workspaceKey.findMany({
    where: { workspaceId, generation: { gte: earliestGeneration } },
    include: {
      workspaceKeyBoxes: {
        where: {
          deviceSigningPublicKey,
          workspaceKeyId: { in: workspaceKeyIds },
        },
        include: {
          creatorDevice: true,
        },
      },
    },
    orderBy: { generation: "asc" },
  });
  return workspaceKeys;
};
