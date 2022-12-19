export type FileInfo = {
  key: string;
  nonce: string;
  fileId: string;
};

export type FileState =
  | {
      step: "uploading" | "downloading" | "failedToDecrypt";
      contentAsBase64: null;
    }
  | {
      step: "done";
      contentAsBase64: string;
    };

export type FileNodeAttributes =
  | {
      subtype: "file";
      subtypeAttributes: {
        fileName: string;
        fileSize: number;
      };
      fileInfo?: FileInfo;
      uploadId?: string | null;
      mimeType: string;
    }
  | {
      subtype: "image";
      subtypeAttributes: {
        width: number | null;
        height: number | null;
      };
      fileInfo?: FileInfo;
      uploadId?: string | null;
      mimeType: string;
    };

export type FileWithBase64Content = {
  content: string;
  name: string;
  size: number;
  mimeType: string;
};

export type ImageWithBase64Content = {
  content: string;
  mimeType: string;
};

export type EncryptAndUploadFunctionFile = (
  fileAsBase64: string
) => Promise<FileInfo>;

type DownloadAndDecryptFileParams = {
  workspaceId: string;
  documentId: string;
  fileId: string;
  publicNonce: string;
  key: string;
};

export type DownloadAndDecryptFileFunction = (
  params: DownloadAndDecryptFileParams
) => Promise<string>;

type ShareOrSaveFileParams = {
  contentAsBase64: string;
  mimeType: string;
  fileName: string;
};

export type ShareOrSaveFileFunction = (params: ShareOrSaveFileParams) => void;

export type InsertImageParams = {
  width: number | null;
  height: number | null;
  uploadId: string;
  mimeType: string;
};

export type InsertFileParams = {
  fileName: string;
  fileSize: number;
  uploadId: string;
  mimeType: string;
};

export type UpdateFileAttributesParams = {
  uploadId: string;
  fileInfo: FileInfo;
};
