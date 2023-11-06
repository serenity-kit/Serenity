import * as userChain from "@serenity-kit/user-chain";
import * as workspaceMemberDevicesProofUtil from "@serenity-kit/workspace-member-devices-proof";
import { equalStringArrays } from "@serenity-tools/common";
import { Prisma } from "../../../prisma/generated/output";
import { prisma } from "../prisma";
import { getLastUserChainEventWithState } from "../userChain/getLastUserChainEventWithState";
import { updateWorkspaceMemberDevicesProof } from "../workspace/updateWorkspaceMemberDevicesProof";

export type Props = {
  userId: string;
  sessionKey: string;
  removeDeviceEvent: userChain.RemoveDeviceEvent | null;
  workspaceMemberDevicesProofEntries:
    | {
        workspaceId: string;
        workspaceMemberDevicesProof: workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProof;
      }[]
    | null;
};
export const logout = async ({
  userId,
  sessionKey,
  removeDeviceEvent,
  workspaceMemberDevicesProofEntries,
}: Props) => {
  return await prisma.$transaction(
    async (prisma) => {
      if (removeDeviceEvent && workspaceMemberDevicesProofEntries) {
        // currently a 1 to 1 relationship, but that could change
        const sessionDevice = await prisma.session.findFirstOrThrow({
          where: { userId, sessionKey, expiresAt: { gt: new Date() } },
          select: { deviceSigningPublicKey: true },
        });
        if (
          sessionDevice.deviceSigningPublicKey !==
          removeDeviceEvent.transaction.signingPublicKey
        ) {
          throw new Error("Device signing public key does not match on logout");
        }
        const { lastUserChainEvent, userChainState } =
          await getLastUserChainEventWithState({ prisma, userId });

        const newUserChainState = userChain.applyEvent({
          state: userChainState,
          event: removeDeviceEvent,
          knownVersion: userChain.version,
        });

        await prisma.userChainEvent.create({
          data: {
            content: removeDeviceEvent,
            state: newUserChainState,
            userId,
            position: lastUserChainEvent.position + 1,
          },
        });

        const userWorkspacesIncludingUnauthorized =
          await prisma.usersToWorkspaces.findMany({
            where: { userId },
            select: { workspaceId: true },
          });

        const workspaceIds = userWorkspacesIncludingUnauthorized.map(
          (entry) => entry.workspaceId
        );

        if (
          !equalStringArrays(
            workspaceMemberDevicesProofEntries.map(
              (entry) => entry.workspaceId
            ),
            workspaceIds
          )
        ) {
          throw new Error("Invalid workspaceMemberDevicesProofEntries");
        }

        for (const entry of workspaceMemberDevicesProofEntries) {
          await updateWorkspaceMemberDevicesProof({
            authorPublicKey: userChainState.mainDeviceSigningPublicKey,
            userId,
            prisma,
            workspaceId: entry.workspaceId,
            userChainEventHash: newUserChainState.eventHash,
            workspaceMemberDevicesProof: entry.workspaceMemberDevicesProof,
          });
        }

        await prisma.device.delete({
          where: {
            signingPublicKey: removeDeviceEvent.transaction.signingPublicKey,
          },
        });
      }

      await prisma.session.deleteMany({
        where: {
          userId,
          sessionKey,
        },
      });
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  );
};
