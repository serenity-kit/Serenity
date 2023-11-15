import {
  crypto_aead_xchacha20poly1305_ietf_KEYBYTES,
  crypto_kdf_derive_from_key,
  from_base64,
  randombytes_uniform,
  to_base64,
} from "react-native-libsodium";
import { KeyDerivationContext } from "../zodTypes";

type Params = {
  key: string;
  context: KeyDerivationContext;
  subkeyId?: number;
};

// TODO figure out how generate a random subkeyId for the full space
// ideally we could leverage the full 2 ** 64 - 1 space, but it's not possible in JavaScript
// While 2 ** 32 - 1 should be a valid uint32_t it failed
const upperBound = 2 ** 31 - 1;

export const createSubkeyId = () => {
  return randombytes_uniform(upperBound);
};

export const kdfDeriveFromKey = (params: Params) => {
  const context = KeyDerivationContext.parse(params.context);
  const subkeyId = params.subkeyId || createSubkeyId();
  const derivedKey = crypto_kdf_derive_from_key(
    crypto_aead_xchacha20poly1305_ietf_KEYBYTES,
    subkeyId,
    context,
    from_base64(params.key)
  );
  return {
    subkeyId,
    key: to_base64(derivedKey),
  };
};
