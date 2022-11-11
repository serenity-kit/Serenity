import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { ForbiddenError, UserInputError } from "apollo-server-express";
// @ts-ignore
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { prisma } from "../prisma";

if (
  !process.env.FILE_STORAGE_ACCOUNT_ID ||
  !process.env.FILE_STORAGE_ACCESS_KEY_ID ||
  !process.env.FILE_STORAGE_SECRET_ACCESS_KEY ||
  !process.env.FILE_STORAGE_BUCKET
) {
  throw new Error("Missing environment variables for file storage");
}

const bucketUrl = `https://${process.env.FILE_STORAGE_ACCOUNT_ID}.r2.cloudflarestorage.com`;
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
  fileId: string;
  documentId: string;
  workspaceId: string;
};

export const getFileUrl = async ({
  userId,
  fileId,
  documentId,
  workspaceId,
}: Props) => {
  const user2Workspace = await prisma.usersToWorkspaces.findFirst({
    where: { userId, workspaceId },
    select: { role: true },
  });
  if (!user2Workspace) {
    throw new ForbiddenError("Unauthorized");
  }
  const document = await prisma.document.findFirst({
    where: { id: documentId, workspaceId },
    select: { id: true },
  });
  if (!document) {
    throw new UserInputError("Invalid documentId");
  }
  const fileName = `${workspaceId}/${documentId}/${fileId}.blob`;
  const downloadUrl = await getSignedUrl(
    s3Client,
    new GetObjectCommand({
      Bucket: process.env.FILE_STORAGE_BUCKET,
      Key: fileName,
    }),
    { expiresIn: 60 }
  );
  return downloadUrl;
};
