import {
  _unstable_crypto_kdf_hkdf_sha256_expand,
  _unstable_crypto_kdf_hkdf_sha256_extract,
  crypto_aead_xchacha20poly1305_ietf_KEYBYTES,
  from_base64,
  randombytes_buf,
  to_base64,
} from "react-native-libsodium";
import { KeyDerivationContext } from "../zodTypes";

type Params = {
  key: string;
  context: KeyDerivationContext;
  subkeyId?: string;
};

export const createSubkeyId = () => {
  return to_base64(randombytes_buf(16));
};

export const kdfDeriveFromKey = (params: Params) => {
  const context = KeyDerivationContext.parse(params.context);
  const subkeyId = params.subkeyId || createSubkeyId();

  const prk = _unstable_crypto_kdf_hkdf_sha256_extract(
    from_base64(params.key),
    from_base64(subkeyId)
  );
  const derivedKey = _unstable_crypto_kdf_hkdf_sha256_expand(
    prk,
    context,
    crypto_aead_xchacha20poly1305_ietf_KEYBYTES
  );

  return {
    subkeyId,
    key: to_base64(derivedKey),
  };
};
