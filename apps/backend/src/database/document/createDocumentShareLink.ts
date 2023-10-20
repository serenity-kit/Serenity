import * as documentChain from "@serenity-kit/document-chain";
import { AddShareDocumentDeviceEvent } from "@serenity-kit/document-chain";
import { ForbiddenError, UserInputError } from "apollo-server-express";
import {
  DocumentShareLink,
  Prisma,
  Role,
} from "../../../prisma/generated/output";
import { getOrCreateCreatorDevice } from "../../utils/device/getOrCreateCreatorDevice";
import { prisma } from "../prisma";

export type SnapshotDeviceKeyBox = {
  ciphertext: string;
  nonce: string;
  deviceSigningPublicKey: string;
};

export type Props = {
  documentId: string;
  sharerUserId: string;
  deviceSecretBoxCiphertext: string;
  deviceSecretBoxNonce: string;
  snapshotDeviceKeyBox: SnapshotDeviceKeyBox;
  documentChainEvent: AddShareDocumentDeviceEvent;
};
export const createDocumentShareLink = async ({
  documentId,
  sharerUserId,
  deviceSecretBoxCiphertext,
  deviceSecretBoxNonce,
  snapshotDeviceKeyBox,
  documentChainEvent,
}: Props): Promise<DocumentShareLink> => {
  // admin access not allowed
  if (
    documentChainEvent.transaction.role !== Role.EDITOR &&
    documentChainEvent.transaction.role !== Role.VIEWER &&
    documentChainEvent.transaction.role !== Role.COMMENTER
  ) {
    throw new UserInputError("invalid sharing role");
  }

  return await prisma.$transaction(
    async (prisma) => {
      // get the document
      const document = await prisma.document.findFirst({
        where: { id: documentId },
      });
      if (!document) {
        throw new ForbiddenError("Unauthorized");
      }
      const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
        where: {
          workspaceId: document.workspaceId,
          userId: sharerUserId,
          role: { in: [Role.ADMIN, Role.EDITOR] },
        },
      });
      if (!userToWorkspace) {
        throw new ForbiddenError("Unauthorized");
      }

      // create the device
      const creatorDevice = await getOrCreateCreatorDevice({
        prisma,
        signingPublicKey: documentChainEvent.author.publicKey,
        userId: sharerUserId,
      });

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

      const documentShareLink = await prisma.documentShareLink.create({
        data: {
          documentId,
          sharerUserId,
          role: documentChainEvent.transaction.role,
          deviceSecretBoxCiphertext,
          deviceSecretBoxNonce,
          deviceSigningPublicKey:
            documentChainEvent.transaction.signingPublicKey,
          deviceEncryptionPublicKey:
            documentChainEvent.transaction.encryptionPublicKey,
          deviceEncryptionPublicKeySignature:
            documentChainEvent.transaction.encryptionPublicKeySignature,
          // documentChainEvent.transaction.expiresAt
        },
      });
      // get the latest snapshot and set up the snapshot key boxes
      const latestSnapshot = await prisma.snapshot.findFirst({
        where: { documentId },
        orderBy: { createdAt: "desc" },
      });
      if (!latestSnapshot) {
        throw new Error("No snapshot found");
      }
      await prisma.snapshotKeyBox.create({
        data: {
          ...snapshotDeviceKeyBox,
          snapshotId: latestSnapshot.id,
          creatorDeviceSigningPublicKey: creatorDevice.signingPublicKey,
          documentShareLinkToken: documentShareLink.token,
        },
      });
      return documentShareLink;
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  );
};
