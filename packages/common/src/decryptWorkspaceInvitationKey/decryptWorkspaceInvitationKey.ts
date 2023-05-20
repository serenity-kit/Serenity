import sodium from "react-native-libsodium";
import { createEncryptionKeyFromOpaqueExportKey } from "../createEncryptionKeyFromOpaqueExportKey/createEncryptionKeyFromOpaqueExportKey";
import { decryptAead } from "../decryptAead/decryptAead";
import { workspaceInvitationDerivedKeyContext } from "../encryptWorkspaceInvitationKey/encryptWorkspaceInvitationKey";
import { kdfDeriveFromKey } from "../kdfDeriveFromKey/kdfDeriveFromKey";

type Params = {
  exportKey: string;
  subkeyId: number;
  ciphertext: string;
  publicNonce: string;
  encryptionKeySalt: string;
};

export const decryptWorkspaceInvitationKey = ({
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
  const result = decryptAead(
    sodium.from_base64(ciphertext),
    publicData,
    sodium.from_base64(derivedEncryptionKey.key),
    publicNonce
  );
  return sodium.to_string(result);
};
