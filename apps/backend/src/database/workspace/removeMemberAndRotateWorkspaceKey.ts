import * as workspaceChain from "@serenity-kit/workspace-chain";
import * as workspaceMemberDevicesProofUtil from "@serenity-kit/workspace-member-devices-proof";
import { ForbiddenError, UserInputError } from "apollo-server-express";
import { Prisma, Role } from "../../../prisma/generated/output";
import { WorkspaceDeviceParing } from "../../types/workspaceDevice";
import { prisma } from "../prisma";
import { getLastWorkspaceChainEventWithState } from "../workspaceChain/getLastWorkspaceChainEventWithState";
import { rotateWorkspaceKey } from "./rotateWorkspaceKey";
import { updateWorkspaceMemberDevicesProof } from "./updateWorkspaceMemberDevicesProof";

export type Props = {
  newDeviceWorkspaceKeyBoxes: WorkspaceDeviceParing[];
  creatorDeviceSigningPublicKey: string;
  workspaceId: string;
  userId: string;
  workspaceChainEvent: workspaceChain.RemoveMemberWorkspaceChainEvent;
  workspaceMemberDevicesProof: workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProof;
  mainDeviceSigningPublicKey: string;
};

export const removeMemberAndRotateWorkspaceKey = async ({
  userId,
  workspaceId,
  creatorDeviceSigningPublicKey,
  newDeviceWorkspaceKeyBoxes,
  workspaceChainEvent,
  workspaceMemberDevicesProof,
  mainDeviceSigningPublicKey,
}) => {
  return await prisma.$transaction(
    async (prisma) => {
      const userToRevoke = await prisma.user.findUniqueOrThrow({
        where: {
          mainDeviceSigningPublicKey:
            workspaceChainEvent.transaction.memberMainDeviceSigningPublicKey,
        },
      });
      // verify user owns workspace
      if (userId === userToRevoke.id) {
        throw new UserInputError("Cannot remove yourself from a workspace");
      }
      const verifiedUserWorkspace = await prisma.usersToWorkspaces.findFirst({
        where: {
          userId,
          workspaceId,
          role: Role.ADMIN,
          isAuthorizedMember: true,
        },
        select: { workspaceId: true },
      });
      if (!verifiedUserWorkspace) {
        throw new ForbiddenError("Unauthorized");
      }
      // verify user owns creatorsignigpublickey
      const verifiedCreatorDevice = await prisma.device.findFirst({
        where: { userId, signingPublicKey: creatorDeviceSigningPublicKey },
      });
      if (!verifiedCreatorDevice) {
        throw new UserInputError("Invalid creatorDeviceSigningPublicKey");
      }

      const { lastWorkspaceChainEvent, workspaceChainState } =
        await getLastWorkspaceChainEventWithState({ prisma, workspaceId });

      const newState = workspaceChain.applyEvent(
        workspaceChainState,
        workspaceChainEvent
      );
      await prisma.workspaceChainEvent.create({
        data: {
          content: workspaceChainEvent,
          state: newState,
          workspaceId,
          position: lastWorkspaceChainEvent.position + 1,
        },
      });

      await updateWorkspaceMemberDevicesProof({
        authorPublicKey: mainDeviceSigningPublicKey,
        userId,
        userIdToRemove: userToRevoke.id,
        prisma,
        workspaceId,
        workspaceMemberDevicesProof,
      });

      // add only devices which will belong to this workspace
      const allowedUsers = await prisma.usersToWorkspaces.findMany({
        where: { workspaceId, userId: { not: userToRevoke.id } },
        select: { userId: true },
      });
      const allowedUserIds = allowedUsers.map(
        (userToWorkspace) => userToWorkspace.userId
      );

      const deviceKeyBoxLookup: {
        [sigingPublicKey: string]: WorkspaceDeviceParing;
      } = {};
      const requestedDeviceSigningPublicKeys: string[] = [];
      newDeviceWorkspaceKeyBoxes.forEach(
        (deviceKeyBox: WorkspaceDeviceParing) => {
          requestedDeviceSigningPublicKeys.push(
            deviceKeyBox.receiverDeviceSigningPublicKey
          );
          deviceKeyBoxLookup[deviceKeyBox.receiverDeviceSigningPublicKey] =
            deviceKeyBox;
        }
      );
      const addableDevices = await prisma.device.findMany({
        where: {
          userId: { in: allowedUserIds },
          signingPublicKey: { in: requestedDeviceSigningPublicKeys },
        },
        select: { signingPublicKey: true },
      });
      const addableDeviceWorkspaceKeyBoxes: WorkspaceDeviceParing[] = [];
      addableDevices.forEach((device) => {
        const deviceKeyBox = deviceKeyBoxLookup[device.signingPublicKey];
        addableDeviceWorkspaceKeyBoxes.push({
          ciphertext: deviceKeyBox.ciphertext,
          nonce: deviceKeyBox.nonce,
          receiverDeviceSigningPublicKey:
            deviceKeyBox.receiverDeviceSigningPublicKey,
        });
      });
      // remove workspaceKeyBoxes for revoked users
      const revokedUserDevices = await prisma.device.findMany({
        where: { userId: userToRevoke.id },
        select: { signingPublicKey: true },
      });
      const revokedUserDeviceSigningPublicKeys = revokedUserDevices.map(
        (device) => device.signingPublicKey
      );
      await prisma.workspaceKeyBox.deleteMany({
        where: {
          workspaceKey: { workspaceId },
          deviceSigningPublicKey: {
            in: revokedUserDeviceSigningPublicKeys,
          },
        },
      });
      // remove user from workspace
      await prisma.usersToWorkspaces.deleteMany({
        where: { workspaceId, userId: userToRevoke.id },
      });
      // rotate keys
      const updatedWorkspaceKey = await rotateWorkspaceKey({
        prisma,
        deviceWorkspaceKeyBoxes: addableDeviceWorkspaceKeyBoxes,
        creatorDeviceSigningPublicKey,
        workspaceId,
        userId,
      });
      return updatedWorkspaceKey;
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  );
};
