import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { generateId } from "@serenity-tools/common";
import { ForbiddenError, UserInputError } from "apollo-server-express";
import { Role } from "../../../prisma/generated/output";
import { prisma } from "../prisma";

if (
  !process.env.FILE_STORAGE_ACCOUNT_ID ||
  !process.env.FILE_STORAGE_ACCESS_KEY_ID ||
  !process.env.FILE_STORAGE_SECRET_ACCESS_KEY ||
  !process.env.FILE_STORAGE_BUCKET
) {
  throw new Error("Missing environment variables for file storage");
}

const bucketUrl = `https://${process.env.FILE_STORAGE_ACCOUNT_ID}.eu.r2.cloudflarestorage.com`;
const s3Client = new S3Client({
  region: "auto",
  endpoint: bucketUrl,
  credentials: {
    accessKeyId: process.env.FILE_STORAGE_ACCESS_KEY_ID,
    secretAccessKey: process.env.FILE_STORAGE_SECRET_ACCESS_KEY,
  },
});

export type Props = {
  userId: string;
  documentId: string;
  workspaceId: string;
};
export const initiateFileUpload = async ({
  userId,
  documentId,
  workspaceId,
}: Props) => {
  const allowedRoles = [Role.ADMIN, Role.EDITOR];
  const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
    where: { userId, workspaceId, role: { in: allowedRoles } },
    select: { role: true },
  });
  if (!userToWorkspace) {
    throw new ForbiddenError("Unauthorized");
  }
  const document = await prisma.document.findFirst({
    where: { id: documentId, workspaceId },
    select: { id: true },
  });
  if (!document) {
    throw new UserInputError("Invalid documentId");
  }
  const fileId = generateId();
  const fileName = `${workspaceId}/${documentId}/${fileId}.blob`;
  const uploadUrl = await getSignedUrl(
    s3Client,
    new PutObjectCommand({
      Bucket: process.env.FILE_STORAGE_BUCKET,
      Key: fileName,
      ContentType: "application/octet-stream",
    }),
    { expiresIn: 60 } // seconds
  );
  return { uploadUrl, fileId };
};
