import * as workspaceMemberDevicesProofUtil from "@serenity-kit/workspace-member-devices-proof";
import { canonicalizeAndToBase64 } from "@serenity-tools/secsync/src/utils/canonicalizeAndToBase64";
import sodium from "react-native-libsodium";
import { decryptAead } from "../decryptAead/decryptAead";
import { verifyWorkspaceInfoSignature } from "../verifyWorkspaceInfoSignature/verifyWorkspaceInfoSignature";

type Params = {
  key: string;
  ciphertext: string;
  nonce: string;
  signature: string;
  workspaceMemberDevicesProof: workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProof;
  workspaceId: string;
  workspaceKeyId: string;
  creatorDeviceSigningPublicKey: string;
};

export const decryptWorkspaceInfo = ({
  key,
  ciphertext,
  signature,
  creatorDeviceSigningPublicKey,
  nonce,
  workspaceId,
  workspaceKeyId,
  workspaceMemberDevicesProof,
}: Params) => {
  const isValid = verifyWorkspaceInfoSignature({
    signature,
    workspaceId,
    workspaceKeyId,
    workspaceMemberDevicesProof,
    authorSigningPublicKey: creatorDeviceSigningPublicKey,
    ciphertext,
    nonce,
  });
  if (!isValid) {
    throw new Error("Invalid workspace info signature");
  }

  const publicDataAsBase64 = canonicalizeAndToBase64(
    {
      workspaceId,
      workspaceKeyId,
      workspaceMemberDevicesProof,
    },
    sodium
  );
  const result = decryptAead(
    sodium.from_base64(ciphertext),
    publicDataAsBase64,
    sodium.from_base64(key),
    nonce
  );
  return JSON.parse(sodium.to_string(result));
};
