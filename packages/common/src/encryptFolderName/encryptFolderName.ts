import * as workspaceMemberDevicesProofUtil from "@serenity-kit/workspace-member-devices-proof";
import { sign } from "@serenity-tools/secsync";
import { canonicalizeAndToBase64 } from "@serenity-tools/secsync/src/utils/canonicalizeAndToBase64";
import sodium from "react-native-libsodium";
import { encryptAead } from "../encryptAead/encryptAead";
import { kdfDeriveFromKey } from "../kdfDeriveFromKey/kdfDeriveFromKey";
import { LocalDevice } from "../types";
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
  device: LocalDevice;
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
  device,
}: Params) => {
  const publicData = {
    workspaceId,
    folderId,
    keyDerivationTrace: KeyDerivationTrace.parse(keyDerivationTrace),
    workspaceMemberDevicesProof,
  };
  const publicDataAsBase64 = canonicalizeAndToBase64(publicData, sodium);
  const folderKey = kdfDeriveFromKey({
    key: parentKey,
    context: folderDerivedKeyContext,
    subkeyId,
  });
  const result = encryptAead(
    name,
    publicDataAsBase64,
    sodium.from_base64(folderKey.key)
  );

  const signature = sign(
    {
      nonce: result.publicNonce,
      ciphertext: result.ciphertext,
      publicData: publicDataAsBase64,
    },
    "folder",
    sodium.from_base64(device.signingPrivateKey),
    sodium
  );

  return {
    folderSubkey: folderKey.key,
    folderSubkeyId: folderKey.subkeyId,
    ciphertext: result.ciphertext,
    nonce: result.publicNonce,
    publicData,
    signature,
  };
};
