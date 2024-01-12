import * as workspaceMemberDevicesProofUtil from "@serenity-kit/workspace-member-devices-proof";
import { verifySignature } from "@serenity-tools/secsync";
import { canonicalizeAndToBase64 } from "@serenity-tools/secsync/src/utils/canonicalizeAndToBase64";
import sodium from "react-native-libsodium";
import { KeyDerivationTrace } from "../zodTypes";

type Params = {
  ciphertext: string;
  nonce: string;
  signature: string;
  authorSigningPublicKey: string;
  workspaceId: string;
  folderId: string;
  keyDerivationTrace: KeyDerivationTrace;
  workspaceMemberDevicesProof: workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProof;
};

export const verifyFolderNameSignature = ({
  signature,
  nonce,
  ciphertext,
  authorSigningPublicKey,
  workspaceId,
  folderId,
  keyDerivationTrace,
  workspaceMemberDevicesProof,
}: Params) => {
  const publicData = {
    workspaceId,
    folderId,
    keyDerivationTrace: KeyDerivationTrace.parse(keyDerivationTrace),
    workspaceMemberDevicesProof,
  };
  const publicDataAsBase64 = canonicalizeAndToBase64(publicData, sodium);

  return verifySignature(
    {
      nonce,
      ciphertext,
      publicData: publicDataAsBase64,
    },
    signature,
    sodium.from_base64(authorSigningPublicKey),
    sodium
  );
};
