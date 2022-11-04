export type FileInfo = {
  key: string;
  nonce: string;
  fileId: string;
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
  uploadId: string;
  width: number | null;
  height: number | null;
};

export type UpdateImageAttributesParams = {
  uploadId: string;
  fileInfo: FileInfo;
};
