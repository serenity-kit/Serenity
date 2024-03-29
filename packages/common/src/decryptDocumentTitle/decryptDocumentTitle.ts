import * as workspaceMemberDevicesProofUtil from "@serenity-kit/workspace-member-devices-proof";
import { decryptDocumentTitleBasedOnSnapshotKey } from "../decryptDocumentTitleBasedOnSnapshotKey/decryptDocumentTitleBasedOnSnapshotKey";
import { deriveKeysFromKeyDerivationTrace } from "../deriveKeysFromKeyDerivationTrace/deriveKeysFromKeyDerivationTrace";
import { Device, LocalDevice } from "../types";
import { KeyDerivationTrace } from "../zodTypes";

type Params = {
  ciphertext: string;
  nonce: string;
  signature: string;
  creatorDeviceSigningPublicKey: string;
  activeDevice: LocalDevice;
  snapshot: {
    keyDerivationTrace: KeyDerivationTrace;
  };
  subkeyId: string;
  workspaceKeyBox: {
    ciphertext: string;
    nonce: string;
    creatorDevice: Device;
  };
  workspaceId: string;
  workspaceKeyId: string;
  documentId: string;
  workspaceMemberDevicesProof: workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProof;
};

export const decryptDocumentTitle = ({
  snapshot,
  activeDevice,
  workspaceKeyBox,
  subkeyId,
  ciphertext,
  nonce,
  workspaceId,
  workspaceKeyId,
  documentId,
  workspaceMemberDevicesProof,
  signature,
  creatorDeviceSigningPublicKey,
}: Params) => {
  const snapshotFolderKeyData = deriveKeysFromKeyDerivationTrace({
    keyDerivationTrace: snapshot.keyDerivationTrace,
    activeDevice: {
      signingPublicKey: activeDevice.signingPublicKey,
      signingPrivateKey: activeDevice.signingPrivateKey!,
      encryptionPublicKey: activeDevice.encryptionPublicKey,
      encryptionPrivateKey: activeDevice.encryptionPrivateKey!,
      encryptionPublicKeySignature: activeDevice.encryptionPublicKeySignature!,
    },
    workspaceKeyBox: workspaceKeyBox,
    workspaceId,
    workspaceKeyId,
  });
  const snapshotKeyData =
    snapshotFolderKeyData.trace[snapshotFolderKeyData.trace.length - 1];
  return decryptDocumentTitleBasedOnSnapshotKey({
    snapshotKey: snapshotKeyData.key,
    subkeyId,
    ciphertext,
    nonce,
    documentId,
    workspaceMemberDevicesProof,
    workspaceId,
    signature,
    creatorDeviceSigningPublicKey,
  });
};
