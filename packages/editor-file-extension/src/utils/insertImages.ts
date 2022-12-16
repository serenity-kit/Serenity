import { v4 as uuidv4 } from "uuid";
import {
  EncryptAndUploadFunctionFile,
  ImageWithBase64Content,
  InsertImageParams,
  UpdateFileAttributesParams,
} from "../types";
import { getImageDimensions } from "./getImageDimensions";

type InsertImagesParams = {
  filesWithBase64Content: ImageWithBase64Content[];
  encryptAndUploadFile: EncryptAndUploadFunctionFile;
  insertImage: (params: InsertImageParams) => void;
  updateFileAttributes: (params: UpdateFileAttributesParams) => void;
};

export const insertImages = ({
  filesWithBase64Content,
  encryptAndUploadFile,
  insertImage,
  updateFileAttributes,
}: InsertImagesParams) => {
  filesWithBase64Content.forEach(async (fileWithBase64Content) => {
    const uploadId = uuidv4();
    const imageDimensions = await getImageDimensions({
      fileAsBase64: fileWithBase64Content.content,
      mimeType: fileWithBase64Content.mimeType,
    });
    insertImage({
      mimeType: fileWithBase64Content.mimeType,
      width: imageDimensions?.width || null,
      height: imageDimensions?.height || null,
      uploadId,
    });
    const result = await encryptAndUploadFile(fileWithBase64Content.content);
    updateFileAttributes({
      uploadId,
      fileInfo: result,
    });
  });
};
