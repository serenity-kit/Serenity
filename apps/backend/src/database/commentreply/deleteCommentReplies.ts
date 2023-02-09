import { UserInputError } from "apollo-server-express";
import { Role } from "../../../prisma/generated/output";
import { prisma } from "../prisma";

type Params = {
  userId: string;
  commentReplyIds: string[];
};

export async function deleteCommentReplies({
  userId,
  commentReplyIds,
}: Params) {
  if (commentReplyIds.length === 0) {
    return;
  }
  return await prisma.$transaction(async (prisma) => {
    // commentReplies can be deleted by:
    // * their creators or
    // * by admins and editors of the workspace
    // later, we will also allow document token holders to delete commentReplies

    // make sure the user has access to the requested documents
    const requestedCommentReplies = await prisma.commentReply.findMany({
      where: { id: { in: commentReplyIds } },
      select: { id: true, document: true, creatorDeviceSigningPublicKey: true },
    });
    const requestedWorkspaceIds: string[] = [];
    requestedCommentReplies.forEach((requestedCommentReply) => {
      if (
        !requestedWorkspaceIds.includes(
          requestedCommentReply.document.workspaceId
        )
      ) {
        requestedWorkspaceIds.push(requestedCommentReply.document.workspaceId);
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

    // also, commenter Repliers can delete their own commentReplies
    const userDevices = await prisma.device.findMany({
      where: { userId },
      select: { signingPublicKey: true },
    });
    const userDeviceSigningPublicKeys = userDevices.map(
      (userDevice) => userDevice.signingPublicKey
    );

    // create a list of deletable commentReplies
    // commentReplies are deletable if the user is an admin or editor of the workspace
    // or if the user is the creator of the commentReply and still has
    // access to the workspace
    const deletableCommentReplyIds: string[] = [];
    requestedCommentReplies.forEach((requestedCommentReply) => {
      if (
        userPrivilegedWorkspaceIds.includes(
          requestedCommentReply.document.workspaceId
        ) ||
        (userDeviceSigningPublicKeys.includes(
          requestedCommentReply.creatorDeviceSigningPublicKey
        ) &&
          userWorkspaceIds.includes(requestedCommentReply.document.workspaceId))
      ) {
        deletableCommentReplyIds.push(requestedCommentReply.id);
      }
    });
    // if some of the commentIds are invalid, throw an error
    if (deletableCommentReplyIds.length !== commentReplyIds.length) {
      throw new UserInputError("Invalid commentIds");
    }

    // delete all related workspace keyboxes
    await prisma.commentReply.deleteMany({
      where: {
        id: {
          in: deletableCommentReplyIds,
        },
      },
    });
  });
}
