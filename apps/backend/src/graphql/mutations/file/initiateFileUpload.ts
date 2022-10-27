import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
// @ts-ignore
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { AuthenticationError } from "apollo-server-express";
import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
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

export const InitiateFileUploadInput = inputObjectType({
  name: "InitiateFileUploadInput",
  definition(t) {
    t.nonNull.string("workspaceId");
    t.nonNull.string("documentId");
  },
});

export const InitiateFileUploadResult = objectType({
  name: "InitiateFileUploadResult",
  definition(t) {
    t.nonNull.string("uploadUrl");
    t.nonNull.string("fileId");
  },
});

export const initiateFileUploadMutation = mutationField("initiateFileUpload", {
  type: InitiateFileUploadResult,
  args: {
    input: nonNull(
      arg({
        type: InitiateFileUploadInput,
      })
    ),
  },
  async resolve(root, args, context) {
    console.log({ args });
    if (!context.user) {
      throw new AuthenticationError("Not authenticated");
    }

    const fileId = uuidv4();
    const fileName = `${args.input.workspaceId}/${args.input.documentId}/${fileId}.blob`;
    const uploadUrl = await getSignedUrl(
      s3Client,
      new PutObjectCommand({
        Bucket: process.env.FILE_STORAGE_BUCKET,
        Key: fileName,
      }),
      { expiresIn: 60 } // seconds
    );

    // const uploadedFile = await prisma.linkedFile.create({
    //   data: {
    //     documentId: args.input.documentId,
    //     workspaceId: args.input.workspaceId,
    //   },
    // });
    // console.log({ uploadedFile });

    return { uploadUrl, fileId };
  },
});
