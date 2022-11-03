import * as sodium from "@serenity-tools/libsodium";
import { runFileUrlQuery } from "../../generated/graphql";
import { decryptFile } from "./decryptFile";

export type Props = {
  workspaceId: string;
  documentId: string;
  fileId: string;
  publicNonce: string;
  key: string;
};
export const downloadFileBase64Bytes = async ({
  fileId,
  documentId,
  workspaceId,
  publicNonce,
  key,
}: Props): Promise<string> => {
  const result = await runFileUrlQuery({ fileId, documentId, workspaceId }, {});
  if (!result.data?.fileUrl?.downloadUrl) {
    throw new Error("Failed to get the file URL");
  }
  const response = await fetch(result.data?.fileUrl.downloadUrl);
  const arrayBuffer = await response.arrayBuffer();
  const encryptedFileBytes = new Uint8Array(arrayBuffer);
  const serializedFileBytes = sodium.to_base64(encryptedFileBytes);
  const decryptedFileData = await decryptFile({
    encryptedBase64FileData: serializedFileBytes,
    publicNonce,
    key,
  });
  return decryptedFileData;
};
