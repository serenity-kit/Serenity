import { generateId } from "@serenity-tools/common";
import { ForbiddenError, UserInputError } from "apollo-server-express";
import { Role, ShareDocumentRole } from "../../../prisma/generated/output";
import { getOrCreateCreatorDevice } from "../../utils/device/getOrCreateCreatorDevice";
import { prisma } from "../prisma";

type Params = {
  userId: string;
  documentShareLinkToken?: string | null | undefined;
  creatorDeviceSigningPublicKey: string;
  commentId: string;
  snapshotId: string;
  subkeyId: number;
  contentCiphertext: string;
  contentNonce: string;
};

export async function createCommentReply({
  userId,
  documentShareLinkToken,
  creatorDeviceSigningPublicKey,
  commentId,
  snapshotId,
  subkeyId,
  contentCiphertext,
  contentNonce,
}: Params) {
  // verify the document exists
  const document = await prisma.document.findFirst({
    where: { activeSnapshotId: snapshotId },
  });
  if (!document) {
    throw new ForbiddenError("Unauthorized");
  }
  // ensure this comment exists also
  const comment = await prisma.comment.findFirst({
    where: { id: commentId },
  });
  if (!comment) {
    throw new UserInputError("Invalid comment id");
  }
  const allowedRoles = [Role.ADMIN, Role.EDITOR, Role.COMMENTER];
  const allowedShareDocumentRoles = [
    ShareDocumentRole.EDITOR,
    ShareDocumentRole.COMMENTER,
  ];
  // if the user has a documentShareLinkToken, verify it
  let documentShareLink: any = null;
  if (documentShareLinkToken) {
    documentShareLink = await prisma.documentShareLink.findFirst({
      where: {
        token: documentShareLinkToken,
        documentId: document.id,
        role: { in: allowedShareDocumentRoles },
      },
    });
    if (!documentShareLink) {
      throw new UserInputError("Invalid documentShareLinkToken");
    }
  } else {
    // if no documentShareLinkToken, the user must have access to the workspace
    const user2Workspace = await prisma.usersToWorkspaces.findFirst({
      where: {
        userId,
        workspaceId: document.workspaceId,
        role: { in: allowedRoles },
      },
    });
    if (!user2Workspace) {
      throw new ForbiddenError("Unauthorized");
    }
  }

  // convert the user's device into a creatorDevice
  const creatorDevice = await getOrCreateCreatorDevice({
    prisma,
    userId,
    signingPublicKey: creatorDeviceSigningPublicKey,
  });

  try {
    const commentReply = await prisma.commentReply.create({
      data: {
        id: generateId(),
        commentId,
        documentId: document.id,
        snapshotId,
        subkeyId,
        creatorDeviceSigningPublicKey: creatorDevice.signingPublicKey,
        contentCiphertext,
        contentNonce,
      },
    });
    return {
      ...commentReply,
      creatorDevice,
    };
  } catch (e) {
    console.log(e);
    throw e;
  }
}
