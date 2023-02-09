import { Role } from "../../../prisma/generated/output";
import { prisma } from "../prisma";

type Params = {
  userId: string;
  commentIds: string[];
};

export async function deleteComments({ userId, commentIds }: Params) {
  return await prisma.$transaction(async (prisma) => {
    // comments can be deleted by:
    // * their creators or
    // * by admins and editors of the workspace
    // later, we will also allow document token holders to delete comments

    // make sure the user has access to the requested documents
    const requestedComments = await prisma.comment.findMany({
      where: { id: { in: commentIds } },
      select: { id: true, document: true, creatorDeviceSigningPublicKey: true },
    });
    const requestedWorkspaceIds: string[] = [];
    requestedComments.forEach((requestedComment) => {
      if (
        !requestedWorkspaceIds.includes(requestedComment.document.workspaceId)
      ) {
        requestedWorkspaceIds.push(requestedComment.document.workspaceId);
      }
    });
    // make a list of all the workspaces the user has rights to change
    const allowedRoles = [Role.ADMIN, Role.EDITOR];
    const userWorkspaceRoles = await prisma.usersToWorkspaces.findMany({
      where: {
        userId,
        workspaceId: { in: requestedWorkspaceIds },
        role: { in: allowedRoles },
      },
      select: { workspaceId: true, role: true },
    });
    const userPrivilegedWorkspaceIds: string[] = [];
    userWorkspaceRoles.forEach((userWorkspaceRole) => {
      userPrivilegedWorkspaceIds.push(userWorkspaceRole.workspaceId);
    });

    // make a list of workspaces the user has access to
    const userWorkspaces = await prisma.usersToWorkspaces.findMany({
      where: {
        userId,
        workspaceId: { in: requestedWorkspaceIds },
      },
      select: { workspaceId: true },
    });
    const userWorkspaceIds: string[] = [];
    userWorkspaces.forEach((userWorkspaceRole) => {
      userWorkspaceIds.push(userWorkspaceRole.workspaceId);
    });

    // also, commenters can delete their own comments
    const userDevices = await prisma.device.findMany({
      where: { userId },
      select: { signingPublicKey: true },
    });
    const userDeviceSigningPublicKeys = userDevices.map(
      (userDevice) => userDevice.signingPublicKey
    );

    // create a list of deletable comments
    // comments are deletable if the user is an admin or editor of the workspace
    // or if the user is the creator of the comment and still has
    // access to the workspace
    const deletableCommentIds: string[] = [];
    requestedComments.forEach((requestedComment) => {
      if (
        userPrivilegedWorkspaceIds.includes(
          requestedComment.document.workspaceId
        ) ||
        (userDeviceSigningPublicKeys.includes(
          requestedComment.creatorDeviceSigningPublicKey
        ) &&
          userWorkspaceIds.includes(requestedComment.document.workspaceId))
      ) {
        deletableCommentIds.push(requestedComment.id);
      }
    });

    // delete all related workspace keyboxes
    await prisma.comment.deleteMany({
      where: {
        id: {
          in: deletableCommentIds,
        },
      },
    });
  });
}
