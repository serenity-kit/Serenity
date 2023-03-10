import { UserInputError } from "apollo-server-express";
import { Role } from "../../../prisma/generated/output";
import { prisma } from "../prisma";

type Params = {
  userId: string;
  commentIds: string[];
  documentShareLinkToken?: string | null | undefined;
};

export async function deleteComments({
  userId,
  commentIds,
  documentShareLinkToken,
}: Params) {
  const privilegedRoles = [Role.ADMIN, Role.EDITOR];
  const userRoles = [Role.ADMIN, Role.EDITOR, Role.COMMENTER];
  if (commentIds.length === 0) {
    throw new UserInputError(
      "Invalid commentIds: commentIds not be an empty array"
    );
  }
  return await prisma.$transaction(async (prisma) => {
    // comments can be deleted by:
    // * their creators or
    // * by admins and editors of the workspace
    // * token holders who have edit rights to the comments' documents

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
    const privilegedWorkspaceRoles = await prisma.usersToWorkspaces.findMany({
      where: {
        userId,
        workspaceId: { in: requestedWorkspaceIds },
        role: { in: privilegedRoles },
      },
      select: { workspaceId: true, role: true },
    });
    const userPrivilegedWorkspaceIds: string[] = [];
    privilegedWorkspaceRoles.forEach((privilegedWorkspaceRole) => {
      userPrivilegedWorkspaceIds.push(privilegedWorkspaceRole.workspaceId);
    });

    // make a list of workspaces the user has access to
    const userWorkspaces = await prisma.usersToWorkspaces.findMany({
      where: {
        userId,
        workspaceId: { in: requestedWorkspaceIds },
        role: { in: userRoles },
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

    // Also allow the user to delete comments if they have
    // edit rights from a documentShareLinkToken or
    // if they were the creator of the comment and still have access
    if (documentShareLinkToken) {
      const privilegedDocumentShareLink =
        await prisma.documentShareLink.findFirst({
          where: {
            token: documentShareLinkToken,
            role: { in: privilegedRoles },
          },
        });
      if (privilegedDocumentShareLink) {
        requestedComments.forEach((requestedComment) => {
          if (
            requestedComment.document.id ===
            privilegedDocumentShareLink.documentId
          ) {
            deletableCommentIds.push(requestedComment.id);
          }
        });
      }
      const userDocumentShareLink = await prisma.documentShareLink.findFirst({
        where: {
          token: documentShareLinkToken,
          role: { in: userRoles },
        },
      });
      if (userDocumentShareLink) {
        requestedComments.forEach((requestedComment) => {
          if (
            requestedComment.document.id === userDocumentShareLink.documentId &&
            requestedComment.creatorDeviceSigningPublicKey ===
              userDocumentShareLink.deviceSigningPublicKey
          ) {
            deletableCommentIds.push(requestedComment.id);
          }
        });
      }
    }
    // if some of the commentIds are invalid, throw an error
    if (deletableCommentIds.length !== commentIds.length) {
      throw new UserInputError("Invalid commentIds");
    }
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
