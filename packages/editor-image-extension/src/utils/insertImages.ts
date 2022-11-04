import { v4 as uuidv4 } from "uuid";
import {
  EncryptAndUploadFunctionFile,
  InsertImageParams,
  UpdateImageAttributesParams,
} from "../types";
import { getWidthAndHeightFromFile } from "./getWidthAndHeightFromFile";

type InsertImagesParams = {
  filesAsBase64: string[];
  encryptAndUploadFile: EncryptAndUploadFunctionFile;
  insertImage: (params: InsertImageParams) => void;
  updateImageAttributes: (params: UpdateImageAttributesParams) => void;
};

export const insertImages = ({
  filesAsBase64,
  encryptAndUploadFile,
  insertImage,
  updateImageAttributes,
}: InsertImagesParams) => {
  filesAsBase64.forEach(async (fileAsBase64) => {
    const uploadId = uuidv4();
    const imageDimensions = await getWidthAndHeightFromFile(fileAsBase64);
    insertImage({
      uploadId,
      width: imageDimensions?.width || null,
      height: imageDimensions?.height || null,
    });
    const result = await encryptAndUploadFile(fileAsBase64);
    updateImageAttributes({
      uploadId,
      fileInfo: result,
    });
  });
};
