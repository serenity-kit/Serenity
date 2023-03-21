import { encryptAead, KeyDerivationTrace2 } from "@naisho/core";
import canonicalize from "canonicalize";
import sodium from "react-native-libsodium";
import { createDocumentKey } from "../createDocumentKey/createDocumentKey";
import { deriveKeysFromKeyDerivationTrace } from "../deriveKeysFromKeyDerivationTrace/deriveKeysFromKeyDerivationTrace";
import { Device, LocalDevice } from "../types";

type WorkspaceKeyBox = {
  ciphertext: string;
  nonce: string;
  creatorDevice: Device;
};

type Params = {
  snapshot: {
    keyDerivationTrace: KeyDerivationTrace2;
  };
  activeDevice: LocalDevice;
  workspaceKeyBox: WorkspaceKeyBox;
  title: string;
  publicData?: any;
};

export const encryptDocumentTitle = (params: Params) => {
  const { activeDevice, workspaceKeyBox } = params;
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
  });
  const snapshotKeyData =
    snapshotFolderKeyData.trace[snapshotFolderKeyData.trace.length - 1];
  const documentKeyData = createDocumentKey({
    snapshotKey: snapshotKeyData.key,
  });
  const publicData = params.publicData || {};
  const canonicalizedPublicData = canonicalize(publicData);
  if (!canonicalizedPublicData) {
    throw new Error("Invalid public data for encrypting the title.");
  }
  const result = encryptAead(
    params.title,
    canonicalizedPublicData,
    sodium.from_base64(documentKeyData.key)
  );
  return {
    ciphertext: result.ciphertext,
    publicNonce: result.publicNonce,
    publicData,
    subkeyId: documentKeyData.subkeyId,
    workspaceKeyId: params.snapshot.keyDerivationTrace.workspaceKeyId,
  };
};
