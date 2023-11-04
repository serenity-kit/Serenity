import canonicalize from "canonicalize";
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
  publicData?: any;
  workspaceId: string;
  workspaceKeyId: string;
};

type EncryptDocumentTitleByKeyParams = {
  title: string;
  publicData?: any;
  key: string;
};

export const encryptDocumentTitleByKey = (
  params: EncryptDocumentTitleByKeyParams
) => {
  const publicData = params.publicData || {};
  const canonicalizedPublicData = canonicalize(publicData);
  if (!canonicalizedPublicData) {
    throw new Error("Invalid public data for encrypting the title.");
  }
  return encryptAead(
    params.title,
    canonicalizedPublicData,
    sodium.from_base64(params.key)
  );
};

export const encryptDocumentTitle = (params: Params) => {
  const {
    activeDevice,
    workspaceKeyBox,

    workspaceId,
    workspaceKeyId,
  } = params;
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
  const publicData = params.publicData || {};
  const result = encryptDocumentTitleByKey({
    title: params.title,
    publicData,
    key: documentTitleKeyData.key,
  });
  return {
    ciphertext: result.ciphertext,
    nonce: result.publicNonce,
    publicData,
    subkeyId: documentTitleKeyData.subkeyId,
    workspaceKeyId: params.snapshot.keyDerivationTrace.workspaceKeyId,
  };
};
