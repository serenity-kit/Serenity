import * as sodium from "@serenity-tools/libsodium";
import { runInitiateFileUploadMutation } from "../../generated/graphql";
import { encryptFile } from "./encryptFile";

export type FileInfo = {
  fileId: string;
  publicNonce: string;
  key: string;
};

export type EncryptAndUploadFunctionParams = {
  base64FileData: string;
  documentId: string;
  workspaceId: string;
};

export type EncryptAndUploadFunction = (
  props: EncryptAndUploadFunctionParams
) => Promise<FileInfo>;

export const encryptAndUploadFile: EncryptAndUploadFunction = async ({
  base64FileData,
  documentId,
  workspaceId,
}) => {
  const key = await sodium.crypto_aead_xchacha20poly1305_ietf_keygen();
  const { encryptedBase64ImageData, publicNonce } = await encryptFile({
    base64FileData,
    key,
  });
  const binaryImageData = sodium.from_base64(encryptedBase64ImageData);
  const result = await runInitiateFileUploadMutation(
    {
      initiateFileUpload: {
        documentId,
        workspaceId,
      },
    },
    {}
  );
  const uploadUrl = result.data?.initiateFileUpload?.uploadUrl;
  const fileId = result.data?.initiateFileUpload?.fileId;
  if (!uploadUrl || !fileId) {
    throw new Error("Missing upload url or fileId");
  }
  const response = await fetch(uploadUrl, {
    method: "PUT",
    body: binaryImageData,
  });
  if (!response || response.status !== 200) {
    throw new Error("Failed to upload the file");
  }
  return {
    fileId,
    publicNonce,
    key,
  };
};
