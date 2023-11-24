import * as documentChain from "@serenity-kit/document-chain";
import { SerenitySnapshotWithClientData } from "@serenity-tools/common";
import { ForbiddenError } from "apollo-server-express";
import { Prisma, Role } from "../../../prisma/generated/output";
import { createSnapshot } from "../createSnapshot";
import { prisma } from "../prisma";

type Params = {
  userId: string;
  nameCiphertext: string;
  nameNonce: string;
  workspaceKeyId?: string | null;
  subkeyId: string; // name/title subkey id
  parentFolderId: string;
  workspaceId: string;
  snapshot: SerenitySnapshotWithClientData;
  documentChainEvent: documentChain.CreateDocumentChainEvent;
};

export async function createDocument({
  userId,
  nameCiphertext,
  nameNonce,
  workspaceKeyId,
  subkeyId,
  parentFolderId,
  workspaceId,
  snapshot,
  documentChainEvent,
}: Params) {
  return await prisma.$transaction(
    async (prisma) => {
      const allowedRoles = [Role.ADMIN, Role.EDITOR];
      // verify that the user is an admin or editor of the workspace
      // and verify the device the event was created with is not expired
      const user2Workspace = await prisma.usersToWorkspaces.findFirst({
        where: { userId, workspaceId, role: { in: allowedRoles } },
        include: {
          user: {
            select: {
              devices: {
                where: {
                  OR: [
                    {
                      signingPublicKey: documentChainEvent.author.publicKey,
                      expiresAt: { gt: new Date() },
                    },
                    {
                      signingPublicKey: documentChainEvent.author.publicKey,
                      expiresAt: null,
                    },
                  ],
                },
              },
            },
          },
        },
      });
      if (!user2Workspace || user2Workspace.user.devices.length === 0) {
        throw new ForbiddenError("Unauthorized");
      }

      const documentChainState = documentChain.resolveState({
        events: [documentChainEvent],
        knownVersion: documentChain.version,
      });

      const document = await prisma.document.create({
        data: {
          id: documentChainState.currentState.id,
          nameCiphertext,
          nameNonce,
          subkeyId,
          workspaceKeyId,
          parentFolderId,
          workspaceId,
        },
      });

      await prisma.documentChainEvent.create({
        data: {
          content: documentChainEvent,
          state: documentChainState.currentState,
          documentId: documentChainState.currentState.id,
          position: 0,
        },
      });

      const snapshotResult = await createSnapshot({
        snapshot,
        prismaTransactionClient: prisma,
      });
      return { document, snapshot: snapshotResult };
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  );
}
