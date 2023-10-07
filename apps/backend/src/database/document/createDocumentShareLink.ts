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
  sharingRole: Role;
  sharerUserId: string;
  deviceSecretBoxCiphertext: string;
  deviceSecretBoxNonce: string;
  creatorDeviceSigningPublicKey: string;
  deviceSigningPublicKey: string;
  deviceEncryptionPublicKey: string;
  deviceEncryptionPublicKeySignature: string;
  snapshotDeviceKeyBox: SnapshotDeviceKeyBox;
};
export const createDocumentShareLink = async ({
  documentId,
  sharingRole,
  sharerUserId,
  deviceSecretBoxCiphertext,
  deviceSecretBoxNonce,
  creatorDeviceSigningPublicKey,
  deviceSigningPublicKey,
  deviceEncryptionPublicKey,
  deviceEncryptionPublicKeySignature,
  snapshotDeviceKeyBox,
}: Props): Promise<DocumentShareLink> => {
  // admin access not allowed
  if (
    sharingRole !== Role.EDITOR &&
    sharingRole !== Role.VIEWER &&
    sharingRole !== Role.COMMENTER
  ) {
    throw new UserInputError("invalid sharing role");
  }
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
  return await prisma.$transaction(
    async (prisma) => {
      // create the device
      const creatorDevice = await getOrCreateCreatorDevice({
        prisma,
        signingPublicKey: creatorDeviceSigningPublicKey,
        userId: sharerUserId,
      });

      const documentShareLink = await prisma.documentShareLink.create({
        data: {
          documentId,
          sharerUserId,
          role: sharingRole,
          deviceSecretBoxCiphertext,
          deviceSecretBoxNonce,
          deviceSigningPublicKey,
          deviceEncryptionPublicKey,
          deviceEncryptionPublicKeySignature,
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
