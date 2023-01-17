import { decryptAead } from "@naisho/core";
import sodium from "@serenity-tools/libsodium";
import { createEncryptionKeyFromOpaqueExportKey } from "../createEncryptionKeyFromOpaqueExportKey/createEncryptionKeyFromOpaqueExportKey";
import { workspaceInvitationDerivedKeyContext } from "../encryptWorkspaceInvitationKey/encryptWorkspaceInvitationKey";
import { kdfDeriveFromKey } from "../kdfDeriveFromKey/kdfDeriveFromKey";

type Params = {
  exportKey: string;
  subkeyId: number;
  ciphertext: string;
  publicNonce: string;
  encryptionKeySalt: string;
};

export const decryptWorkspaceInvitationKey = async ({
  exportKey,
  subkeyId,
  ciphertext,
  publicNonce,
  encryptionKeySalt,
}: Params) => {
  const publicData = "";
  const { encryptionKey } = createEncryptionKeyFromOpaqueExportKey(
    exportKey,
    encryptionKeySalt
  );
  const derivedEncryptionKey = kdfDeriveFromKey({
    key: encryptionKey,
    context: workspaceInvitationDerivedKeyContext,
    subkeyId,
  });
  const result = await decryptAead(
    sodium.from_base64(ciphertext),
    publicData,
    derivedEncryptionKey.key,
    publicNonce
  );
  return sodium.from_base64_to_string(result);
};
