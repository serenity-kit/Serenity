import { v4 as uuidv4 } from "uuid";
import {
  EncryptAndUploadFunctionFile,
  InsertFileParams,
  UpdateFileAttributesParams,
} from "../types";

type InsertFilesParams = {
  filesAsBase64: string[];
  encryptAndUploadFile: EncryptAndUploadFunctionFile;
  insertFile: (params: InsertFileParams) => void;
  updateFileAttributes: (params: UpdateFileAttributesParams) => void;
};

export const insertFiles = ({
  filesAsBase64,
  encryptAndUploadFile,
  insertFile,
  updateFileAttributes,
}: InsertFilesParams) => {
  filesAsBase64.forEach(async (fileAsBase64) => {
    const uploadId = uuidv4();
    insertFile({
      fileName: "janedoe.txt",
      fileSize: 2000,
      uploadId,
    });
    const result = await encryptAndUploadFile(fileAsBase64);
    updateFileAttributes({
      uploadId,
      fileInfo: result,
    });
  });
};
