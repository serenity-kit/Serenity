import { encryptAead } from "@naisho/core";
import { createEncryptionKeyFromOpaqueExportKey } from "../createEncryptionKeyFromOpaqueExportKey/createEncryptionKeyFromOpaqueExportKey";
import { kdfDeriveFromKey } from "../kdfDeriveFromKey/kdfDeriveFromKey";

export type Params = {
  exportKey: string;
  workspaceInvitationSigningPrivateKey: string;
};

// Having a specific "wsinvite" context allows us to use have the same subkeyId
// for one parentKey and checking only the uniquness for this type.
export const workspaceInvitationDerivedKeyContext = "wsinvite";

export const encryptWorkspaceInvitationPrivateKey = async ({
  exportKey,
  workspaceInvitationSigningPrivateKey,
}: Params) => {
  const publicData = "";
  const { encryptionKey, encryptionKeySalt } =
    await createEncryptionKeyFromOpaqueExportKey(exportKey);

  const derivedEncryptionKey = await kdfDeriveFromKey({
    key: encryptionKey,
    context: workspaceInvitationDerivedKeyContext,
  });
  const result = await encryptAead(
    workspaceInvitationSigningPrivateKey,
    publicData,
    derivedEncryptionKey.key
  );
  return {
    key: derivedEncryptionKey.key,
    subkeyId: derivedEncryptionKey.subkeyId,
    ciphertext: result.ciphertext,
    publicNonce: result.publicNonce,
    publicData,
    encryptionKeySalt,
  };
};