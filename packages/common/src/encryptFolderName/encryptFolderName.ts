import * as workspaceMemberDevicesProofUtil from "@serenity-kit/workspace-member-devices-proof";
import canonicalize from "canonicalize";
import sodium from "react-native-libsodium";
import { encryptAead } from "../encryptAead/encryptAead";
import { kdfDeriveFromKey } from "../kdfDeriveFromKey/kdfDeriveFromKey";
import { KeyDerivationTrace } from "../zodTypes";

type Params = {
  name: string;
  // parentKey is the master key for the workspace or the key of the parent folder
  parentKey: string;
  folderId: string;
  workspaceId: string;
  keyDerivationTrace: KeyDerivationTrace;
  subkeyId: string;
  workspaceMemberDevicesProof: workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProof;
};

// Having a specific "folder__" context allows us to use have the same subkeyId
// for one parentKey and checking only the uniqueness for this type.
export const folderDerivedKeyContext = "folder__";

export const encryptFolderName = ({
  folderId,
  name,
  keyDerivationTrace,
  parentKey,
  workspaceId,
  subkeyId,
  workspaceMemberDevicesProof,
}: Params) => {
  const publicData = {
    workspaceId,
    folderId,
    keyDerivationTrace: KeyDerivationTrace.parse(keyDerivationTrace),
    workspaceMemberDevicesProof,
  };
  const canonicalizedPublicData = canonicalize(publicData);
  if (!canonicalizedPublicData) {
    throw new Error("Invalid public data for encrypting the name.");
  }
  const folderKey = kdfDeriveFromKey({
    key: parentKey,
    context: folderDerivedKeyContext,
    subkeyId,
  });
  const result = encryptAead(
    name,
    canonicalizedPublicData,
    sodium.from_base64(folderKey.key)
  );

  // const folderSignature = sodium.crypto_sign_detached(
  //   "folder" + folderId,
  //   sodium.from_base64(activeDevice.signingPrivateKey!)
  // );

  return {
    folderSubkey: folderKey.key,
    folderSubkeyId: folderKey.subkeyId,
    ciphertext: result.ciphertext,
    nonce: result.publicNonce,
    publicData,
    signature: "TODO",
  };
};
