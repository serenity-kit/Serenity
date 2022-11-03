import * as sodium from "@serenity-tools/libsodium";
import { runInitiateFileUploadMutation } from "../../generated/graphql";
import { encryptFile } from "./encryptFile";

type CreateEncryptAndUploadFileFunctionParams = {
  documentId: string;
  workspaceId: string;
};

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    // TODO: handle errors
    // @ts-expect-error - throw if not a string
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

export const createEncryptAndUploadFileFunction = ({
  documentId,
  workspaceId,
}: CreateEncryptAndUploadFileFunctionParams) => {
  return async (file: File) => {
    const imageAsBase64 = await fileToBase64(file);
    const key = await sodium.crypto_aead_xchacha20poly1305_ietf_keygen();
    const { encryptedBase64ImageData, publicNonce } = await encryptFile({
      base64FileData: imageAsBase64,
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

    return { fileId, key, nonce: publicNonce };
  };
};
