import sodium from "react-native-libsodium";
import { runInitiateFileUploadMutation } from "../../generated/graphql";
import { encryptFile } from "./encryptFile";

type CreateEncryptAndUploadFileFunctionParams = {
  documentId: string;
  workspaceId: string;
};

export const createEncryptAndUploadFileFunction = ({
  documentId,
  workspaceId,
}: CreateEncryptAndUploadFileFunctionParams) => {
  return async (fileAsBase64: string) => {
    const key = sodium.to_base64(
      sodium.crypto_aead_xchacha20poly1305_ietf_keygen()
    );
    const { fileCiphertext, publicNonce } = encryptFile({
      base64FileData: fileAsBase64,
      key,
    });
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
      body: fileCiphertext,
      // mode: "cors",
    });
    if (!response || response.status !== 200) {
      throw new Error("Failed to upload the file");
    }

    return { fileId, key, nonce: publicNonce };
  };
};
