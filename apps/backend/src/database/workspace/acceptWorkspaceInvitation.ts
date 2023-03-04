import { Device } from "@serenity-tools/common";
import { ForbiddenError, UserInputError } from "apollo-server-express";
import canonicalize from "canonicalize";
import sodium from "react-native-libsodium";
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
    const doesSignatureVerify = sodium.crypto_sign_verify_detached(
      sodium.from_base64(inviteeUsernameAndDeviceSignature),
      inviteeInfo!,
      sodium.from_base64(workspaceInvitation.invitationSigningPublicKey)
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
