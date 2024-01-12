import * as workspaceMemberDevicesProofUtil from "@serenity-kit/workspace-member-devices-proof";
import { canonicalizeAndToBase64 } from "@serenity-tools/secsync/src/utils/canonicalizeAndToBase64";
import sodium from "react-native-libsodium";
import { decryptAead } from "../decryptAead/decryptAead";
import { folderDerivedKeyContext } from "../encryptFolderName/encryptFolderName";
import { kdfDeriveFromKey } from "../kdfDeriveFromKey/kdfDeriveFromKey";
import { verifyFolderNameSignature } from "../verifyFolderNameSignature/verifyFolderNameSignature";
import { KeyDerivationTrace } from "../zodTypes";

type Params = {
  // parentKey is the master key for the workspace or the key of the parent folder
  parentKey: string;
  subkeyId: string;
  ciphertext: string;
  nonce: string;
  folderId: string;
  workspaceId: string;
  keyDerivationTrace: KeyDerivationTrace;
  signature: string;
  workspaceMemberDevicesProof: workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProof;
  creatorDeviceSigningPublicKey: string;
};

export const decryptFolderName = ({
  workspaceId,
  folderId,
  keyDerivationTrace,
  ciphertext,
  nonce,
  parentKey,
  subkeyId,
  signature,
  workspaceMemberDevicesProof,
  creatorDeviceSigningPublicKey,
}: Params) => {
  const isValid = verifyFolderNameSignature({
    signature,
    folderId,
    workspaceId,
    keyDerivationTrace,
    workspaceMemberDevicesProof,
    authorSigningPublicKey: creatorDeviceSigningPublicKey,
    ciphertext,
    nonce,
  });
  if (!isValid) {
    throw new Error("Invalid folder name signature");
  }

  const publicData = {
    workspaceId,
    folderId,
    keyDerivationTrace: KeyDerivationTrace.parse(keyDerivationTrace),
    workspaceMemberDevicesProof,
  };
  const publicDataAsBase64 = canonicalizeAndToBase64(publicData, sodium);
  if (!publicDataAsBase64) {
    throw new Error("Invalid public data for decrypting the folder.");
  }
  const folderKey = kdfDeriveFromKey({
    key: parentKey,
    context: folderDerivedKeyContext,
    subkeyId: subkeyId,
  });
  const result = decryptAead(
    sodium.from_base64(ciphertext),
    publicDataAsBase64,
    sodium.from_base64(folderKey.key),
    nonce
  );
  return sodium.to_string(result);
};
