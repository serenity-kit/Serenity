import { PrismaClient } from "@prisma/client";
import * as workspaceMemberDevicesProofUtil from "@serenity-kit/workspace-member-devices-proof";
import { getLastWorkspaceChainEventWithState } from "../workspaceChain/getLastWorkspaceChainEventWithState";
import { getWorkspaceMemberDevicesProofByWorkspaceId } from "./getWorkspaceMemberDevicesProofByWorkspaceId";

type Params = {
  workspaceId: string;
  userId: string;
  /* userChainEventHash to be updated for the provided userId  */
  userChainEventHash?: string;
  userIdToRemove?: string;
  prisma: PrismaClient;
  workspaceMemberDevicesProof: workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProof;
  authorPublicKey: string;
};

export async function updateWorkspaceMemberDevicesProof({
  userId,
  workspaceId,
  userChainEventHash,
  userIdToRemove,
  workspaceMemberDevicesProof,
  authorPublicKey,
  prisma,
}: Params) {
  const { workspaceChainState } = await getLastWorkspaceChainEventWithState({
    prisma,
    workspaceId,
  });

  const existingWorkspaceMemberDevicesProof =
    await getWorkspaceMemberDevicesProofByWorkspaceId({
      prisma,
      workspaceId,
    });

  let userChainHashes =
    existingWorkspaceMemberDevicesProof.data.userChainHashes;
  if (userChainEventHash) {
    userChainHashes = {
      ...existingWorkspaceMemberDevicesProof.data.userChainHashes,
      [userId]: userChainEventHash,
    };
  }
  if (userIdToRemove) {
    delete userChainHashes[userIdToRemove];
  }

  const workspaceMemberDevicesProofData: workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProofData =
    {
      clock: existingWorkspaceMemberDevicesProof.proof.clock + 1,
      workspaceChainHash: workspaceChainState.lastEventHash,
      userChainHashes,
    };

  if (
    !workspaceMemberDevicesProofUtil.isValidWorkspaceMemberDevicesProof({
      workspaceMemberDevicesProof,
      authorPublicKey,
      workspaceMemberDevicesProofData,
    })
  ) {
    throw new Error(
      "Invalid workspaceMemberDevicesProof in updateWorkspaceMemberDevicesProof"
    );
  }

  await prisma.workspaceMemberDevicesProof.create({
    data: {
      workspaceId,
      hash: workspaceMemberDevicesProof.hash,
      clock: workspaceMemberDevicesProofData.clock,
      proof: workspaceMemberDevicesProof,
      data: workspaceMemberDevicesProofData,
      authorMainDeviceSigningPublicKey: authorPublicKey,
    },
  });
}
