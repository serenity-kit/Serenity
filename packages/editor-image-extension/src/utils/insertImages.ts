import { v4 as uuidv4 } from "uuid";
import {
  EncryptAndUploadFunctionFile,
  InsertImageParams,
  UpdateImageAttributesParams,
} from "../types";
import { getWidthAndHeightFromFile } from "./getWidthAndHeightFromFile";

type InsertImagesParams = {
  images: File[];
  encryptAndUploadFile: EncryptAndUploadFunctionFile;
  insertImage: (params: InsertImageParams) => void;
  updateImageAttributes: (params: UpdateImageAttributesParams) => void;
};

export const insertImages = ({
  images,
  encryptAndUploadFile,
  insertImage,
  updateImageAttributes,
}: InsertImagesParams) => {
  images.forEach(async (file) => {
    const uploadId = uuidv4();
    const imageDimensions = await getWidthAndHeightFromFile(file);
    insertImage({
      uploadId,
      width: imageDimensions?.width || null,
      height: imageDimensions?.height || null,
    });
    const result = await encryptAndUploadFile(file);
    updateImageAttributes({
      uploadId,
      fileInfo: result,
    });
  });
};
