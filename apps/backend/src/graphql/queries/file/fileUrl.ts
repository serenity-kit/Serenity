import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { AuthenticationError } from "apollo-server-express";
import { idArg, nonNull, queryField } from "nexus";
import { File } from "../../types/file";
// @ts-ignore
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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

export const fileUrlQuery = queryField((t) => {
  t.field("fileUrl", {
    type: File,
    args: {
      fileId: nonNull(idArg()),
      documentId: nonNull(idArg()),
      workspaceId: nonNull(idArg()),
    },
    async resolve(root, args, context) {
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }
      const workspaceId = args.workspaceId;
      const documentId = args.documentId;
      // TODO: verify that the user has access to the document
      const fileName = `${workspaceId}/${documentId}/${args.fileId}.blob`;
      const downloadUrl = await getSignedUrl(
        s3Client,
        new GetObjectCommand({
          Bucket: process.env.FILE_STORAGE_BUCKET,
          Key: fileName,
        }),
        { expiresIn: 60 }
      );
      return {
        id: args.fileId,
        downloadUrl,
      };
    },
  });
});
