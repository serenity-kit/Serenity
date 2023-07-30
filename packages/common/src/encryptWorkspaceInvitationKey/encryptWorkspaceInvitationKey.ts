import sodium from "react-native-libsodium";
import { encryptAead } from "../encryptAead/encryptAead";
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

  const derivedEncryptionKey = kdfDeriveFromKey({
    key: sodium.to_base64(
      sodium.from_base64(exportKey).subarray(0, sodium.crypto_kdf_KEYBYTES)
    ),
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
  };
};
