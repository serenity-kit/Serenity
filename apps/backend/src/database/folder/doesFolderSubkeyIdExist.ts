import { prisma } from "../prisma";

export type Params = {
  subkeyId: number;
  userId: string;
};
export const doesFolderSubkeyIdExist = async ({
  subkeyId,
  userId,
}: Params): Promise<boolean> => {
  const userToWorkspaces = await prisma.usersToWorkspaces.findMany({
    where: { userId },
    select: { workspaceId: true },
  });
  const workspaceIds: string[] = [];
  userToWorkspaces.forEach((userToWorkspace) => {
    workspaceIds.push(userToWorkspace.workspaceId);
  });
  const existingFolderWithSubKeyId = await prisma.folder.findFirst({
    where: { subKeyId: subkeyId, workspaceId: { in: workspaceIds } },
  });
  if (existingFolderWithSubKeyId) {
    return true;
  } else {
    return false;
  }
};
