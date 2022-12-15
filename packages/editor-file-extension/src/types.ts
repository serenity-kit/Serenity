export type FileInfo = {
  key: string;
  nonce: string;
  fileId: string;
};

export type FileWithBase64Content = {
  content: string;
  name: string;
  size: number;
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

export type InsertImageParams = {
  width: number | null;
  height: number | null;
  uploadId: string;
};

export type InsertFileParams = {
  fileName: string;
  fileSize: number;
  uploadId: string;
};

export type UpdateFileAttributesParams = {
  uploadId: string;
  fileInfo: FileInfo;
};
