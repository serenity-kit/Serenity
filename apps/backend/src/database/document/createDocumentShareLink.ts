// create a device and that is encrypted with a secret bo

import { ForbiddenError } from "apollo-server-express";
import { DocumentShareLink, Role } from "../../../prisma/generated/output";
import { prisma } from "../prisma";

// inputs are:
// documentId: string
// deviceSecretBoxCipherTex: string;
// deviceSecretBoxNonce: string;
// device: { signingPublicKey, encryptionPublicKey, encryptionPublickeySignature }

// return device from database

export type Props = {
  documentId: string;
  sharingRole: Role;
  sharerUserId: string;
  deviceSecretBoxCiphertext: string;
  deviceSecretBoxNonce: string;
  deviceSigningPublicKey: string;
  deviceEncryptionPublicKey: string;
  deviceEncryptionPublicKeySignature: string;
};
export const createDocumentShareLink = async ({
  documentId,
  sharingRole,
  sharerUserId,
  deviceSecretBoxCiphertext,
  deviceSecretBoxNonce,
  deviceSigningPublicKey,
  deviceEncryptionPublicKey,
  deviceEncryptionPublicKeySignature,
}: Props): Promise<DocumentShareLink> => {
  // get the document
  const document = await prisma.document.findFirst({
    where: { id: documentId },
  });
  if (!document) {
    throw new ForbiddenError("Unauthorized");
  }
  // make sure the user has access to the document
  // by checking if they have a connection in the
  // userToWorkspace, where the document.workspaceId matches
  // the userToWorkspace.workspaceId
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
  const creatorDevice = await prisma.creatorDevice.create({
    data: {
      signingPublicKey: deviceSigningPublicKey,
      encryptionPublicKey: deviceEncryptionPublicKey,
      encryptionPublicKeySignature: deviceEncryptionPublicKeySignature,
      user: {
        connect: {
          id: sharerUserId,
        },
      },
    },
  });

  const documentShareLink = await prisma.documentShareLink.create({
    data: {
      documentId,
      role: sharingRole,
      deviceSecretBoxCiphertext,
      deviceSecretBoxNonce,
      creatorDeviceSigningPublicKey: creatorDevice.signingPublicKey,
    },
  });

  return documentShareLink;
};
