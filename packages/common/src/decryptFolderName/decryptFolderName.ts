import canonicalize from "canonicalize";
import sodium from "react-native-libsodium";
import { decryptAead } from "../decryptAead/decryptAead";
import { folderDerivedKeyContext } from "../encryptFolderName/encryptFolderName";
import { kdfDeriveFromKey } from "../kdfDeriveFromKey/kdfDeriveFromKey";
import { KeyDerivationTrace } from "../zodTypes";

type Params = {
  // parentKey is the master key for the workspace or the key of the parent folder
  parentKey: string;
  subkeyId: number;
  ciphertext: string;
  nonce: string;
  folderId: string;
  workspaceId: string;
  keyDerivationTrace: KeyDerivationTrace;
};

export const decryptFolderName = ({
  workspaceId,
  folderId,
  keyDerivationTrace,
  ciphertext,
  nonce,
  parentKey,
  subkeyId,
}: Params) => {
  const publicData = {
    workspaceId,
    folderId,
    keyDerivationTrace: KeyDerivationTrace.parse(keyDerivationTrace),
  };
  const canonicalizedPublicData = canonicalize(publicData);
  if (!canonicalizedPublicData) {
    throw new Error("Invalid public data for decrypting the folder.");
  }
  const folderKey = kdfDeriveFromKey({
    key: parentKey,
    context: folderDerivedKeyContext,
    subkeyId: subkeyId,
  });
  const result = decryptAead(
    sodium.from_base64(ciphertext),
    canonicalizedPublicData,
    sodium.from_base64(folderKey.key),
    nonce
  );
  return sodium.to_string(result);
};
