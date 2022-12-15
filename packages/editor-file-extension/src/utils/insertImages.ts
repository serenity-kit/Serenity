import { v4 as uuidv4 } from "uuid";
import {
  EncryptAndUploadFunctionFile,
  InsertImageParams,
  UpdateFileAttributesParams,
} from "../types";
import { getWidthAndHeightFromFile } from "./getWidthAndHeightFromFile";

type InsertImagesParams = {
  filesAsBase64: string[];
  encryptAndUploadFile: EncryptAndUploadFunctionFile;
  insertImage: (params: InsertImageParams) => void;
  updateFileAttributes: (params: UpdateFileAttributesParams) => void;
};

export const insertImages = ({
  filesAsBase64,
  encryptAndUploadFile,
  insertImage,
  updateFileAttributes,
}: InsertImagesParams) => {
  filesAsBase64.forEach(async (fileAsBase64) => {
    const uploadId = uuidv4();
    const imageDimensions = await getWidthAndHeightFromFile(fileAsBase64);
    insertImage({
      width: imageDimensions?.width || null,
      height: imageDimensions?.height || null,
      uploadId,
    });
    const result = await encryptAndUploadFile(fileAsBase64);
    updateFileAttributes({
      uploadId,
      fileInfo: result,
    });
  });
};
