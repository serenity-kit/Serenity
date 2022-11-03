import { v4 as uuidv4 } from "uuid";
import {
  EncryptAndUploadFunction,
  InsertImageParams,
  UpdateImageAttributesParams,
} from "../types";
import { getWidthAndHeightFromFile } from "./getWidthAndHeightFromFile";

type InsertImagesParams = {
  images: File[];
  encryptAndUpload: EncryptAndUploadFunction;
  insertImage: (params: InsertImageParams) => void;
  updateImageAttributes: (params: UpdateImageAttributesParams) => void;
};

export const insertImages = ({
  images,
  encryptAndUpload,
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
    const result = await encryptAndUpload(file);
    updateImageAttributes({
      uploadId,
      fileInfo: result,
    });
  });
};
