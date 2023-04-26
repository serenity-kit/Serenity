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
  subkeyId: number;
  workspaceKeyBox: {
    ciphertext: string;
    nonce: string;
    creatorDevice: Device;
  };
};

export const decryptDocumentTitle = ({
  snapshot,
  activeDevice,
  workspaceKeyBox,
  subkeyId,
  ciphertext,
  nonce,
  publicData,
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
