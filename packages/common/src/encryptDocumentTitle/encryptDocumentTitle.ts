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
};

type EncryptDocumentTitleByKeyParams = {
  title: string;
  key: string;
};

export const encryptDocumentTitleByKey = (
  params: EncryptDocumentTitleByKeyParams
) => {
  const publicDataAsBase64 = canonicalizeAndToBase64({}, sodium);
  return encryptAead(
    params.title,
    publicDataAsBase64,
    sodium.from_base64(params.key)
  );
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
  const publicData = {};
  const result = encryptDocumentTitleByKey({
    title: params.title,
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
