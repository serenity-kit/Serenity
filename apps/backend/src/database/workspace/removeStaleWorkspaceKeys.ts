import { ForbiddenError } from "apollo-server-express";
import { Prisma } from "../../../prisma/generated/output";

export type Props = {
  prisma: Prisma.TransactionClient;
  userId: string;
  workspaceIds: string[];
};
export const removeStaleWorkspaceKeys = async ({
  prisma,
  userId,
  workspaceIds,
}: Props) => {
  // get workspace Ids for all workspaces owned by user
  const userToWorkspaces = await prisma.usersToWorkspaces.findMany({
    where: { userId, workspaceId: { in: workspaceIds } },
    select: { workspaceId: true },
  });
  if (userToWorkspaces.length === 0) {
    throw new ForbiddenError("Unauthorized");
  }
  const verifiedWorkspaceIds = userToWorkspaces.map(
    (userToWorkspace) => userToWorkspace.workspaceId
  );

  // find all generations of workspacekeys for each workspace
  const workspaceKeys = await prisma.workspaceKey.findMany({
    where: { workspaceId: { in: verifiedWorkspaceIds } },
    include: { workspaceKeyBoxes: true },
    orderBy: { generation: "desc" },
  });

  // get all workspaceKeyBoxes
  const deviceKeyYoungestGenerationLookup: {
    [workspaceId: string]: {
      [signingPublicKey: string]: number;
    };
  } = {};
  workspaceKeys.forEach((workspaceKey) => {
    workspaceKey.workspaceKeyBoxes.forEach((workspaceKeyBox) => {
      if (!deviceKeyYoungestGenerationLookup[workspaceKey.workspaceId]) {
        deviceKeyYoungestGenerationLookup[workspaceKey.workspaceId] = {};
      }
      deviceKeyYoungestGenerationLookup[workspaceKey.workspaceId][
        workspaceKeyBox.deviceSigningPublicKey
      ] = workspaceKey.generation;
    });
  });

  // find oldest common generation for all device keys for each workspace
  // and delete all workspaceKeys older than that
  let deleteConditions: { [key: string]: any }[] = [];
  for (let workspaceId of Object.keys(deviceKeyYoungestGenerationLookup)) {
    const oldestCommonGeneration = Math.min(
      ...Object.values(deviceKeyYoungestGenerationLookup[workspaceId])
    );
    deleteConditions.push({
      workspaceId,
      generation: { lt: oldestCommonGeneration },
    });
  }
  await prisma.workspaceKey.deleteMany({
    where: {
      AND: deleteConditions,
    },
  });
};
