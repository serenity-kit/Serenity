import { decryptWorkspaceKey } from "../decryptWorkspaceKey/decryptWorkspaceKey";
import { kdfDeriveFromKey } from "../kdfDeriveFromKey/kdfDeriveFromKey";
import { Device, LocalDevice } from "../types";
import { KeyDerivationTrace, KeyDerivationTraceWithKeys } from "../zodTypes";

type Params = {
  keyDerivationTrace: KeyDerivationTrace;
  activeDevice: LocalDevice;
  workspaceKeyBox: {
    ciphertext: string;
    nonce: string;
    creatorDevice: Device;
  };
  workspaceId: string;
  workspaceKeyId: string;
};

export const deriveKeysFromKeyDerivationTrace = ({
  keyDerivationTrace,
  activeDevice,
  workspaceKeyBox,
  workspaceId,
  workspaceKeyId,
}: Params): KeyDerivationTraceWithKeys => {
  // TODO verify that creator
  // needs a workspace key chain with a main device!
  const workspaceKey = decryptWorkspaceKey({
    ciphertext: workspaceKeyBox.ciphertext,
    nonce: workspaceKeyBox.nonce,
    creatorDeviceEncryptionPublicKey:
      workspaceKeyBox.creatorDevice.encryptionPublicKey,
    receiverDeviceEncryptionPrivateKey: activeDevice.encryptionPrivateKey!,
    workspaceId,
    workspaceKeyId,
  });

  const keyDerivationTraceWithKeys: KeyDerivationTraceWithKeys = {
    workspaceKeyId: keyDerivationTrace.workspaceKeyId,
    trace: [],
  };
  let parentKey = workspaceKey;
  keyDerivationTrace.trace.forEach((keyDerivationTraceEntry) => {
    const ancestorKeyData = kdfDeriveFromKey({
      key: parentKey,
      // @ts-expect-error only know if it's a string at this point
      context: keyDerivationTraceEntry.context,
      subkeyId: keyDerivationTraceEntry.subkeyId,
    });
    parentKey = ancestorKeyData.key;
    keyDerivationTraceWithKeys.trace.push({
      ...keyDerivationTraceEntry,
      key: ancestorKeyData.key,
    });
  });
  return keyDerivationTraceWithKeys;
};
