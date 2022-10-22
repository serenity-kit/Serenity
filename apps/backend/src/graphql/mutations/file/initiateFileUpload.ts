import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
// @ts-ignore
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { AuthenticationError } from "apollo-server-express";
import { mutationField, objectType } from "nexus";
import { v4 as uuidv4 } from "uuid";

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

export const InitiateFileUploadResult = objectType({
  name: "InitiateFileUploadResult",
  definition(t) {
    t.nonNull.string("uploadUrl");
    t.string("fileUrl");
  },
});

export const initiateFileUploadMutation = mutationField("initiateFileUpload", {
  type: InitiateFileUploadResult,
  async resolve(root, args, context) {
    if (!context.user) {
      throw new AuthenticationError("Not authenticated");
    }

    const fileName = `test/me/${uuidv4()}.v1.blob`;
    const uploadUrl = await getSignedUrl(
      s3Client,
      new PutObjectCommand({
        Bucket: process.env.FILE_STORAGE_BUCKET,
        Key: fileName,
      }),
      { expiresIn: 3600 }
    );

    return { uploadUrl, fileUrl: `${bucketUrl}/${fileName}` };
  },
});
