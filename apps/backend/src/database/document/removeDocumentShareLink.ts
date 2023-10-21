import * as documentChain from "@serenity-kit/document-chain";
import { RemoveShareDocumentDeviceEvent } from "@serenity-kit/document-chain";
import { ForbiddenError, UserInputError } from "apollo-server-express";
import { Prisma, Role } from "../../../prisma/generated/output";
import { prisma } from "../prisma";

export type Props = {
  userId: string;
  documentChainEvent: RemoveShareDocumentDeviceEvent;
};
export const removeDocumentShareLink = async ({
  userId,
  documentChainEvent,
}: Props) => {
  return await prisma.$transaction(
    async (prisma) => {
      const documentShareLink = await prisma.documentShareLink.findFirst({
        where: {
          deviceSigningPublicKey:
            documentChainEvent.transaction.signingPublicKey,
        },
      });
      if (!documentShareLink) {
        throw new UserInputError("Invalid deviceSigningPublicKey");
      }
      const documentId = documentShareLink.documentId;
      const document = await prisma.document.findFirst({
        where: { id: documentId },
      });
      if (!document) {
        throw new ForbiddenError("Unauthorized");
      }
      const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
        where: {
          workspaceId: document.workspaceId,
          userId,
          role: { in: [Role.ADMIN, Role.EDITOR] },
        },
      });
      if (!userToWorkspace) {
        throw new ForbiddenError("Unauthorized");
      }

      const lastDocumentChainEvent =
        await prisma.documentChainEvent.findFirstOrThrow({
          where: { documentId },
          orderBy: { position: "desc" },
        });

      const documentChainState = documentChain.DocumentChainState.parse(
        lastDocumentChainEvent.state
      );

      const newUserChainState = documentChain.applyEvent({
        state: documentChainState,
        event: documentChainEvent,
        knownVersion: documentChain.version,
      });

      await prisma.documentChainEvent.create({
        data: {
          content: documentChainEvent,
          state: newUserChainState,
          documentId,
          position: lastDocumentChainEvent.position + 1,
        },
      });

      await prisma.document.update({
        where: { id: documentId },
        data: { requiresSnapshot: true },
      });
      await prisma.documentShareLink.delete({
        where: {
          deviceSigningPublicKey:
            documentChainEvent.transaction.signingPublicKey,
        },
      });
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  );
};
