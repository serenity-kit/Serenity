import sodium from "react-native-libsodium";
import { decryptAead } from "../decryptAead/decryptAead";
import { kdfDeriveFromKey } from "../kdfDeriveFromKey/kdfDeriveFromKey";

type Params = {
  exportKey: string;
  subkeyId: number;
  ciphertext: string;
  publicNonce: string;
};

export const decryptWorkspaceInvitationKey = ({
  exportKey,
  subkeyId,
  ciphertext,
  publicNonce,
}: Params) => {
  const publicData = "";

  const derivedEncryptionKey = kdfDeriveFromKey({
    key: sodium.to_base64(
      sodium.from_base64(exportKey).subarray(0, sodium.crypto_kdf_KEYBYTES)
    ),
    context: "wsinvite",
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
