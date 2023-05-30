import * as workspaceChain from "@serenity-kit/workspace-chain";
import { ForbiddenError } from "apollo-server-express";
import { Workspace, formatWorkspace } from "../../types/workspace";
import { prisma } from "../prisma";

type Params = {
  invitationId: string;
  acceptInvitationSignature: string;
  acceptInvitationAuthorSignature: string;
  inviteeMainDeviceSigningPublicKey: string;
  currentUserId: string;
};

export async function acceptWorkspaceInvitation({
  invitationId,
  acceptInvitationSignature,
  acceptInvitationAuthorSignature,
  inviteeMainDeviceSigningPublicKey,
  currentUserId,
}: Params): Promise<Workspace> {
  return await prisma.$transaction(async (prisma) => {
    // try to find this workspace invitation id
    const currentTime = new Date();
    const workspaceInvitation = await prisma.workspaceInvitations.findFirst({
      where: {
        id: invitationId,
        expiresAt: {
          gt: currentTime,
        },
      },
    });
    if (!workspaceInvitation) {
      throw new ForbiddenError("Unauthorized");
    }

    const currentUser = await prisma.user.findUniqueOrThrow({
      where: { id: currentUserId },
    });
    if (
      currentUser.mainDeviceSigningPublicKey !==
      inviteeMainDeviceSigningPublicKey
    ) {
      throw new Error(
        "inviteeMainDeviceSigningPublicKey does not belong to the user"
      );
    }

    // verify the signatures
    const isValid = workspaceChain.verifyAcceptInvitation({
      acceptInvitationAuthorSignature,
      acceptInvitationSignature,
      expiresAt: workspaceInvitation.expiresAt,
      invitationId,
      invitationSigningPublicKey:
        workspaceInvitation.invitationSigningPublicKey,
      mainDeviceSigningPublicKey: inviteeMainDeviceSigningPublicKey,
      workspaceId: workspaceInvitation.workspaceId,
      role: workspaceInvitation.role,
    });
    if (!isValid) {
      throw new Error("Invalid workspace accept data");
    }

    const workspaceId = workspaceInvitation.workspaceId;
    // check if this user already has access to this workspace
    const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
      where: {
        userId: currentUserId,
        workspaceId,
      },
      select: {
        workspace: {
          include: {
            usersToWorkspaces: {
              include: {
                user: {
                  select: {
                    username: true,
                    devices: {
                      select: {
                        signingPublicKey: true,
                        encryptionPublicKey: true,
                        encryptionPublicKeySignature: true,
                      },
                    },
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
      // TODO throw error instead
      const workspace = formatWorkspace(userToWorkspace.workspace);
      return workspace;
    } else {
      // if they don't, create a new user to workspace relationship
      await prisma.usersToWorkspaces.create({
        data: {
          userId: currentUserId,
          workspaceId,
          role: workspaceInvitation.role,
          isAuthorizedMember: false,
          acceptInvitationSignature,
          acceptInvitationAuthorSignature,
        },
      });
      // and return the workspace
      const connectedWorkspace = await prisma.workspace.findFirstOrThrow({
        where: {
          id: workspaceId,
        },
        include: {
          usersToWorkspaces: {
            include: {
              user: {
                select: {
                  username: true,
                  devices: {
                    select: {
                      signingPublicKey: true,
                      encryptionPublicKey: true,
                      encryptionPublicKeySignature: true,
                    },
                  },
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
