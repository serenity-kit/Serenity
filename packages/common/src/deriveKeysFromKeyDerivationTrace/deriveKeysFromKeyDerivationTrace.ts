import { KeyDerivationTrace2, KeyDerivationTraceWithKeys } from "@naisho/core";
import { decryptWorkspaceKey } from "../decryptWorkspaceKey/decryptWorkspaceKey";
import { kdfDeriveFromKey } from "../kdfDeriveFromKey/kdfDeriveFromKey";
import { Device, LocalDevice } from "../types";

type Params = {
  keyDerivationTrace: KeyDerivationTrace2;
  activeDevice: LocalDevice;
  workspaceKeyBox: {
    ciphertext?: string;
    nonce?: string;
    creatorDevice?: Device | null;
  };
};

export const deriveKeysFromKeyDerivationTrace = ({
  keyDerivationTrace,
  activeDevice,
  workspaceKeyBox,
}: Params): KeyDerivationTraceWithKeys => {
  console.log({ workspaceKeyBox });
  const workspaceKey = decryptWorkspaceKey({
    ciphertext: workspaceKeyBox.ciphertext!,
    nonce: workspaceKeyBox.nonce!,
    creatorDeviceEncryptionPublicKey:
      workspaceKeyBox.creatorDevice!.encryptionPublicKey,
    receiverDeviceEncryptionPrivateKey: activeDevice.encryptionPrivateKey!,
  });

  const keyDerivationTraceWithKeys: KeyDerivationTraceWithKeys = {
    workspaceKeyId: keyDerivationTrace.workspaceKeyId,
    trace: [],
  };
  let parentKey = workspaceKey;
  keyDerivationTrace.trace.forEach((keyDerivationTraceEntry) => {
    const ancestorKeyData = kdfDeriveFromKey({
      key: parentKey,
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
