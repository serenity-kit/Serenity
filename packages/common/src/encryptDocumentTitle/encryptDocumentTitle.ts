import * as workspaceMemberDevicesProofUtil from "@serenity-kit/workspace-member-devices-proof";
import { sign } from "@serenity-tools/secsync";
import { canonicalizeAndToBase64 } from "@serenity-tools/secsync/src/utils/canonicalizeAndToBase64";
import sodium from "react-native-libsodium";
import { createDocumentTitleKey } from "../createDocumentTitleKey/createDocumentTitleKey";
import { deriveKeysFromKeyDerivationTrace } from "../deriveKeysFromKeyDerivationTrace/deriveKeysFromKeyDerivationTrace";
import { encryptAead } from "../encryptAead/encryptAead";
import { Device, LocalDevice } from "../types";
import { KeyDerivationTrace } from "../zodTypes";

type WorkspaceKeyBox = {
  ciphertext: string;
  nonce: string;
  creatorDevice: Device;
};

type Params = {
  snapshot: {
    keyDerivationTrace: KeyDerivationTrace;
  };
  activeDevice: LocalDevice;
  workspaceKeyBox: WorkspaceKeyBox;
  title: string;
  workspaceId: string;
  workspaceKeyId: string;
  documentId: string;
  workspaceMemberDevicesProof: workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProof;
};

type EncryptDocumentTitleByKeyParams = {
  title: string;
  key: string;
  workspaceId: string;
  documentId: string;
  workspaceMemberDevicesProof: workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProof;
  activeDevice: LocalDevice;
};

export const encryptDocumentTitleByKey = (
  params: EncryptDocumentTitleByKeyParams
) => {
  const publicDataAsBase64 = canonicalizeAndToBase64(
    {
      documentId: params.documentId,
      workspaceId: params.workspaceId,
      workspaceMemberDevicesProof: params.workspaceMemberDevicesProof,
    },
    sodium
  );

  const result = encryptAead(
    params.title,
    publicDataAsBase64,
    sodium.from_base64(params.key)
  );

  const signature = sign(
    {
      nonce: result.publicNonce,
      ciphertext: result.ciphertext,
    },
    "document_name",
    sodium.from_base64(params.activeDevice.signingPrivateKey),
    sodium
  );

  return {
    ciphertext: result.ciphertext,
    publicNonce: result.publicNonce,
    signature,
  };
};

export const encryptDocumentTitle = (params: Params) => {
  const { activeDevice, workspaceKeyBox, workspaceId, workspaceKeyId } = params;
  const snapshotFolderKeyData = deriveKeysFromKeyDerivationTrace({
    keyDerivationTrace: params.snapshot.keyDerivationTrace,
    activeDevice: {
      signingPublicKey: activeDevice.signingPublicKey,
      signingPrivateKey: activeDevice.signingPrivateKey!,
      encryptionPublicKey: activeDevice.encryptionPublicKey,
      encryptionPrivateKey: activeDevice.encryptionPrivateKey!,
      encryptionPublicKeySignature: activeDevice.encryptionPublicKeySignature!,
    },
    workspaceKeyBox,
    workspaceId,
    workspaceKeyId,
  });
  const snapshotKeyData =
    snapshotFolderKeyData.trace[snapshotFolderKeyData.trace.length - 1];
  const documentTitleKeyData = createDocumentTitleKey({
    snapshotKey: snapshotKeyData.key,
  });
  const result = encryptDocumentTitleByKey({
    title: params.title,
    key: documentTitleKeyData.key,
    documentId: params.documentId,
    workspaceId: params.workspaceId,
    workspaceMemberDevicesProof: params.workspaceMemberDevicesProof,
    activeDevice,
  });

  return {
    ciphertext: result.ciphertext,
    nonce: result.publicNonce,
    signature: result.signature,
    subkeyId: documentTitleKeyData.subkeyId,
    workspaceKeyId: params.snapshot.keyDerivationTrace.workspaceKeyId,
  };
};
