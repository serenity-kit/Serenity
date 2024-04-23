import * as workspaceMemberDevicesProofUtil from "@serenity-kit/workspace-member-devices-proof";
import { prisma } from "../prisma";

type Cursor = {
  id: string;
};

type Params = {
  userId: string;
  cursor?: Cursor;
  skip?: number;
  take: number;
};
export async function getWorkspaceMemberDevicesProofs({
  userId,
  cursor,
  skip,
  take,
}: Params) {
  const userToWorkspaces = await prisma.usersToWorkspaces.findMany({
    where: {
      userId,
    },
  });
  const workspaces = await prisma.workspace.findMany({
    where: { id: { in: userToWorkspaces.map((u) => u.workspaceId) } },
    cursor,
    skip,
    take,
    include: {
      workspaceMemberDevicesProofs: {
        orderBy: { clock: "desc" },
        take: 1,
      },
    },
  });
  return workspaces.map((workspace) => {
    const proof = workspace.workspaceMemberDevicesProofs[0];
    if (!proof || !proof.data || !proof.proof) {
      throw new Error(
        `Workspace ${workspace.id} has no workspaceMemberDevicesProofs`
      );
    }

    return {
      proof:
        proof.proof as workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProof,
      data: proof.data as workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProofData,
      serializedData: JSON.stringify(proof.data),
      workspaceId: workspace.id,
      authorMainDeviceSigningPublicKey: proof.authorMainDeviceSigningPublicKey,
    };
  });
}
