import { runFileUrlQuery } from "../../generated/graphql";
import { decryptFile } from "./decryptFile";

type CreateDownloadAndDecryptFileFunctionProps = {
  documentId: string;
  documentShareLinkToken?: string;
};

export type Props = {
  fileId: string;
  publicNonce: string;
  key: string;
};
export const createDownloadAndDecryptFileFunction = ({
  documentId,
  documentShareLinkToken,
}: CreateDownloadAndDecryptFileFunctionProps) => {
  return async ({ fileId, publicNonce, key }: Props): Promise<string> => {
    const result = await runFileUrlQuery(
      { fileId, documentId, documentShareLinkToken },
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
