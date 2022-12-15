import { v4 as uuidv4 } from "uuid";
import {
  EncryptAndUploadFunctionFile,
  FileWithBase64Content,
  InsertFileParams,
  UpdateFileAttributesParams,
} from "../types";

type InsertFilesParams = {
  filesWithBase64Content: FileWithBase64Content[];
  encryptAndUploadFile: EncryptAndUploadFunctionFile;
  insertFile: (params: InsertFileParams) => void;
  updateFileAttributes: (params: UpdateFileAttributesParams) => void;
};

export const insertFiles = ({
  filesWithBase64Content,
  encryptAndUploadFile,
  insertFile,
  updateFileAttributes,
}: InsertFilesParams) => {
  filesWithBase64Content.forEach(async (fileWithBase64Content) => {
    const uploadId = uuidv4();
    insertFile({
      fileName: fileWithBase64Content.name,
      fileSize: fileWithBase64Content.size,
      uploadId,
    });
    const result = await encryptAndUploadFile(fileWithBase64Content.content);
    updateFileAttributes({
      uploadId,
      fileInfo: result,
    });
  });
};
