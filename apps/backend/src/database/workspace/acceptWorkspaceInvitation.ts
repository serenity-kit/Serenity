import { Device } from "@serenity-tools/common";
import sodium from "@serenity-tools/libsodium";
import { ForbiddenError, UserInputError } from "apollo-server-express";
import canonicalize from "canonicalize";
import { Role } from "../../../prisma/generated/output";
import { formatWorkspace, Workspace } from "../../types/workspace";
import { prisma } from "../prisma";

type Params = {
  workspaceInvitationId: string;
  inviteeUsername: string;
  inviteeMainDevice: Device;
  inviteeUsernameAndDeviceSignature: string;
  userId: string;
};

export async function acceptWorkspaceInvitation({
  workspaceInvitationId,
  inviteeUsername,
  inviteeMainDevice,
  inviteeUsernameAndDeviceSignature,
  userId,
}: Params): Promise<Workspace> {
  return await prisma.$transaction(async (prisma) => {
    // try to find this workspace invitation id
    const currentTime = new Date();
    const workspaceInvitation = await prisma.workspaceInvitations.findFirst({
      where: {
        id: workspaceInvitationId,
        expiresAt: {
          gt: currentTime,
        },
      },
    });
    if (!workspaceInvitation) {
      throw new ForbiddenError("Unauthorized");
    }
    // verify the signature
    const inviteeInfo = canonicalize({
      username: inviteeUsername,
      mainDevice: {
        signingPublicKey: inviteeMainDevice.signingPublicKey,
        encryptionPublicKey: inviteeMainDevice.encryptionPublicKey,
        encryptionPublicKeySignature:
          inviteeMainDevice.encryptionPublicKeySignature,
      },
    });
    const doesSignatureVerify = await sodium.crypto_sign_verify_detached(
      inviteeUsernameAndDeviceSignature,
      inviteeInfo!,
      workspaceInvitation.invitationSigningPublicKey
    );
    if (!doesSignatureVerify) {
      throw new UserInputError("invalid inviteeUsernameAndDeviceSignature");
    }
    const workspaceId = workspaceInvitation.workspaceId;
    // check if this user already has access to this workspace
    const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
      where: {
        userId,
        workspaceId,
      },
      select: {
        workspace: {
          select: {
            id: true,
            idSignature: true,
            name: true,
            usersToWorkspaces: {
              select: {
                userId: true,
                role: true,
                user: {
                  select: {
                    username: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    // if they do, return the workspace
    if (userToWorkspace) {
      const workspace = formatWorkspace(userToWorkspace.workspace);
      return workspace;
    } else {
      // if they don't, create a new user to workspace relationship
      await prisma.usersToWorkspaces.create({
        data: {
          userId,
          workspaceId,
          role: Role.EDITOR,
          isAuthorizedMember: false,
        },
      });
      // and return the workspace
      const connectedWorkspace = await prisma.workspace.findFirst({
        where: {
          id: workspaceId,
        },
        select: {
          id: true,
          idSignature: true,
          name: true,
          usersToWorkspaces: {
            select: {
              userId: true,
              role: true,
              user: {
                select: {
                  username: true,
                },
              },
            },
          },
        },
      });
      const workspace = formatWorkspace(connectedWorkspace);
      return workspace;
    }
  });
}
