import * as workspaceMemberDevicesProofUtil from "@serenity-kit/workspace-member-devices-proof";
import { sign } from "@serenity-tools/secsync";
import { canonicalizeAndToBase64 } from "@serenity-tools/secsync/src/utils/canonicalizeAndToBase64";
import sodium from "react-native-libsodium";
import { encryptAead } from "../encryptAead/encryptAead";
import { LocalDevice } from "../types";

type Params = {
  name: string;
  avatar?: string;
  key: string;
  workspaceMemberDevicesProof: workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProof;
  workspaceId: string;
  workspaceKeyId: string;
  device: LocalDevice;
};

export const encryptWorkspaceInfo = ({
  workspaceId,
  workspaceKeyId,
  device,
  key,
  name,
  avatar,
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

  const result = encryptAead(
    JSON.stringify({ name, avatar }),
    publicDataAsBase64,
    sodium.from_base64(key)
  );

  const signature = sign(
    {
      nonce: result.publicNonce,
      ciphertext: result.ciphertext,
      publicData: publicDataAsBase64,
    },
    sodium.from_base64(device.signingPrivateKey),
    sodium
  );

  return {
    ciphertext: result.ciphertext,
    nonce: result.publicNonce,
    signature,
  };
};
