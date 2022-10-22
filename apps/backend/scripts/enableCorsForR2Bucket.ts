import { PutBucketCorsCommand, S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

if (
  !process.env.FILE_STORAGE_ACCOUNT_ID ||
  !process.env.FILE_STORAGE_ACCESS_KEY_ID ||
  !process.env.FILE_STORAGE_SECRET_ACCESS_KEY ||
  !process.env.FILE_STORAGE_BUCKET
) {
  throw new Error("Missing environment variables for file storage");
}

// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/s3-example-configuring-buckets.html
// https://github.com/awsdocs/aws-doc-sdk-examples/blob/main/javascriptv3/example_code/s3/src/s3_setcors.js

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.FILE_STORAGE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.FILE_STORAGE_ACCESS_KEY_ID,
    secretAccessKey: process.env.FILE_STORAGE_SECRET_ACCESS_KEY,
  },
});

export const corsParams = {
  Bucket: process.env.FILE_STORAGE_BUCKET,
  CORSConfiguration: {
    CORSRules: [
      {
        AllowedHeaders: ["Authorization"],
        AllowedMethods: ["PUT", "GET"],
        AllowedOrigins: ["*"], // TODO lock it down
        ExposeHeaders: [], // TODO "content-type"? application/octet-steam
        MaxAgeSeconds: 3000,
      },
    ],
  },
};

const command = new PutBucketCorsCommand(corsParams);

export const run = async () => {
  try {
    const data = await s3Client.send(command);
    console.log("Success", data);
    return data; // For unit tests.
  } catch (err) {
    console.log("Error", err);
  }
};

run();
