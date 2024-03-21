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
  fileId: string;
  documentId: string;
  documentShareLinkToken?: string | null | undefined;
};

export const getFileUrl = async ({
  userId,
  fileId,
  documentId,
  documentShareLinkToken,
}: Props) => {
  // verify the document exists
  const document = await prisma.document.findFirst({
    where: { id: documentId },
  });
  if (!document) {
    throw new ForbiddenError("Unauthorized");
  }
  // if the user has a documentShareLinkToken, verify it
  let documentShareLink: any = null;
  if (documentShareLinkToken) {
    documentShareLink = await prisma.documentShareLink.findFirst({
      where: {
        token: documentShareLinkToken,
        documentId,
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
      },
    });
    if (!user2Workspace) {
      throw new ForbiddenError("Unauthorized");
    }
  }

  const fileName = `${document.workspaceId}/${documentId}/${fileId}.blob`;
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
