import * as workspaceMemberDevicesProofUtil from "@serenity-kit/workspace-member-devices-proof";
import { ForbiddenError, UserInputError } from "apollo-server-express";
import { Role, ShareDocumentRole } from "../../../prisma/generated/output";
import { getOrCreateCreatorDevice } from "../../utils/device/getOrCreateCreatorDevice";
import { prisma } from "../prisma";
import { getWorkspaceMemberDevicesProof } from "../workspace/getWorkspaceMemberDevicesProof";

type Params = {
  commentId: string;
  userId: string;
  documentShareLinkToken?: string | null | undefined;
  creatorDeviceSigningPublicKey: string;
  snapshotId: string;
  subkeyId: string;
  contentCiphertext: string;
  contentNonce: string;
  signature: string;
};

export async function createComment({
  commentId,
  userId,
  documentShareLinkToken,
  creatorDeviceSigningPublicKey,
  snapshotId,
  subkeyId,
  contentCiphertext,
  contentNonce,
  signature,
}: Params) {
  return await prisma.$transaction(async (prisma) => {
    let workspaceMemberDevicesProof: null | workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProof =
      null;

    // verify the document exists
    const document = await prisma.document.findFirst({
      where: { activeSnapshotId: snapshotId },
    });
    if (!document) {
      throw new ForbiddenError("Unauthorized");
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

      const workspaceMemberDevicesProofEntry =
        await getWorkspaceMemberDevicesProof({
          workspaceId: user2Workspace.workspaceId,
          userId,
          prisma,
        });
      workspaceMemberDevicesProof = workspaceMemberDevicesProofEntry.proof;
    }

    // convert the user's device into a creatorDevice
    const creatorDevice = await getOrCreateCreatorDevice({
      prisma,
      userId,
      signingPublicKey: creatorDeviceSigningPublicKey,
    });

    const comment = await prisma.comment.create({
      data: {
        id: commentId,
        documentId: document.id,
        snapshotId,
        creatorDeviceSigningPublicKey: creatorDevice.signingPublicKey,
        contentCiphertext,
        contentNonce,
        subkeyId,
        signature,
        workspaceMemberDevicesProofHash: workspaceMemberDevicesProof?.hash,
      },
    });
    return {
      ...comment,
      creatorDevice,
    };
  });
}
