import { hkdf } from "@noble/hashes/hkdf";
import { sha256 } from "@noble/hashes/sha256";
import {
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
  const derivedKey = hkdf(
    sha256,
    from_base64(params.key),
    subkeyId,
    context,
    crypto_aead_xchacha20poly1305_ietf_KEYBYTES
  );

  return {
    subkeyId,
    key: to_base64(derivedKey),
  };
};
