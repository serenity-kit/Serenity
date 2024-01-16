import * as workspaceMemberDevicesProofUtil from "@serenity-kit/workspace-member-devices-proof";
import { verifySignature } from "@serenity-tools/secsync";
import { canonicalizeAndToBase64 } from "@serenity-tools/secsync/src/utils/canonicalizeAndToBase64";
import sodium from "react-native-libsodium";

type Params = {
  ciphertext: string;
  nonce: string;
  signature: string;
  authorSigningPublicKey: string;
  workspaceId: string;
  workspaceKeyId: string;
  workspaceMemberDevicesProof: workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProof;
};

export const verifyWorkspaceInfoSignature = ({
  signature,
  nonce,
  ciphertext,
  authorSigningPublicKey,
  workspaceId,
  workspaceKeyId,
  workspaceMemberDevicesProof,
}: Params) => {
  const publicDataAsBase64 = canonicalizeAndToBase64(
    {
      workspaceId,
      workspaceKeyId,
      workspaceMemberDevicesProof,
    },
    sodium
  );

  return verifySignature(
    {
      nonce,
      ciphertext,
      publicData: publicDataAsBase64,
    },
    "workspace_info",
    signature,
    sodium.from_base64(authorSigningPublicKey),
    sodium
  );
};
