import { decryptDocumentTitleBasedOnSnapshotKey } from "../decryptDocumentTitleBasedOnSnapshotKey/decryptDocumentTitleBasedOnSnapshotKey";
import { deriveKeysFromKeyDerivationTrace } from "../deriveKeysFromKeyDerivationTrace/deriveKeysFromKeyDerivationTrace";
import { Device, LocalDevice } from "../types";
import { KeyDerivationTrace } from "../zodTypes";

type Params = {
  ciphertext: string;
  nonce: string;
  publicData?: any;
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
};

export const decryptDocumentTitle = ({
  snapshot,
  activeDevice,
  workspaceKeyBox,
  subkeyId,
  ciphertext,
  nonce,
  publicData,
  workspaceId,
  workspaceKeyId,
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
    publicData,
  });
};
