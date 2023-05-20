import { encryptAead } from "@serenity-tools/common";
import sodium from "react-native-libsodium";
import { createEncryptionKeyFromOpaqueExportKey } from "../createEncryptionKeyFromOpaqueExportKey/createEncryptionKeyFromOpaqueExportKey";
import { kdfDeriveFromKey } from "../kdfDeriveFromKey/kdfDeriveFromKey";

export type Params = {
  exportKey: string;
  workspaceInvitationSigningPrivateKey: string;
};

// Having a specific "wsinvite" context allows us to use have the same subkeyId
// for one parentKey and checking only the uniquness for this type.
export const workspaceInvitationDerivedKeyContext = "wsinvite";

export const encryptWorkspaceInvitationPrivateKey = ({
  exportKey,
  workspaceInvitationSigningPrivateKey,
}: Params) => {
  const publicData = "";
  const { encryptionKey, encryptionKeySalt } =
    createEncryptionKeyFromOpaqueExportKey(exportKey);

  const derivedEncryptionKey = kdfDeriveFromKey({
    key: encryptionKey,
    context: workspaceInvitationDerivedKeyContext,
  });
  const result = encryptAead(
    workspaceInvitationSigningPrivateKey,
    publicData,
    sodium.from_base64(derivedEncryptionKey.key)
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
