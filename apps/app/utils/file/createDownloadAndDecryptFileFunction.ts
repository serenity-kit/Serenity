import { runFileUrlQuery } from "../../generated/graphql";
import { decryptFile } from "./decryptFile";

type CreateDownloadAndDecryptFileFunctionProps = {
  workspaceId: string;
  documentId: string;
};

export type Props = {
  fileId: string;
  publicNonce: string;
  key: string;
};
export const createDownloadAndDecryptFileFunction = ({
  documentId,
  workspaceId,
}: CreateDownloadAndDecryptFileFunctionProps) => {
  return async ({ fileId, publicNonce, key }: Props): Promise<string> => {
    const result = await runFileUrlQuery(
      { fileId, documentId, workspaceId },
      {}
    );
    if (!result.data?.fileUrl?.downloadUrl) {
      throw new Error("Failed to get the file URL");
    }
    const response = await fetch(result.data?.fileUrl.downloadUrl);
    const arrayBuffer = await response.arrayBuffer();
    const fileCiphertext = new Uint8Array(arrayBuffer);
    const decryptedFileData = decryptFile({
      fileCiphertext,
      publicNonce,
      key,
    });
    return decryptedFileData;
  };
};
