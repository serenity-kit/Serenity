import { PrismaClient } from "@prisma/client";
import * as workspaceMemberDevicesProofUtil from "@serenity-kit/workspace-member-devices-proof";

type Params = {
  workspaceId: string;
  prisma: PrismaClient;
};
export async function getWorkspaceMemberDevicesProofByWorkspaceId({
  workspaceId,
  prisma,
}: Params) {
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
