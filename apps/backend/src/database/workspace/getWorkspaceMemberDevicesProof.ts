import * as workspaceMemberDevicesProofUtil from "@serenity-kit/workspace-member-devices-proof";
import { ForbiddenError } from "apollo-server-express";
import { prisma } from "../prisma";

type Params = {
  workspaceId: string;
  userId: string;
};
export async function getWorkspaceMemberDevicesProof({
  workspaceId,
  userId,
}: Params) {
  const userWorkspace = await prisma.usersToWorkspaces.findFirst({
    where: {
      userId,
      workspaceId,
    },
    select: { workspace: true },
  });
  if (!userWorkspace) {
    throw new ForbiddenError("Unauthorized");
  }
  const workspaceMemberDevicesProof =
    await prisma.workspaceMemberDevicesProof.findFirstOrThrow({
      where: {
        workspaceId,
      },
      orderBy: {
        clock: "desc",
      },
    });

  return {
    proof:
      workspaceMemberDevicesProof.proof as workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProof,
    data: workspaceMemberDevicesProof.data as workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProofData,
    serializedData: JSON.stringify(workspaceMemberDevicesProof.data),
    workspaceId,
  };
}