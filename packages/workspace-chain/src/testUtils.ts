import sodium from "libsodium-wrappers";

export type KeyPairs = {
  sign: { privateKey: string; publicKey: string; keyType: "ed25519" };
  box: { privateKey: string; publicKey: string; keyType: "x25519" };
};

export const getKeyPairA = (): sodium.KeyPair => {
  return {
    privateKey: sodium.from_base64(
      "g3dtwb9XzhSzZGkxTfg11t1KEIb4D8rO7K54R6dnxArvgg_OzZ2GgREtG7F5LvNp3MS8p9vsio4r6Mq7SZDEgw"
    ),
    publicKey: sodium.from_base64(
      "74IPzs2dhoERLRuxeS7zadzEvKfb7IqOK-jKu0mQxIM"
    ),
    keyType: "ed25519",
  };
};

export const getKeyPairB = (): sodium.KeyPair => {
  return {
    privateKey: sodium.from_base64(
      "JyI15wGDAmduTUfhmzkIYePqFdPaEG3QLUdRrkqC1dAxMOGpUgx-VMPQJqv4pI_UxYIgRiqzYsFpd9TbR2LS1g"
    ),
    publicKey: sodium.from_base64(
      "MTDhqVIMflTD0Car-KSP1MWCIEYqs2LBaXfU20di0tY"
    ),
    keyType: "ed25519",
  };
};

export const getKeyPairC = (): sodium.KeyPair => {
  return {
    privateKey: sodium.from_base64(
      "W4EYSNTXQqkbv6_P1MF6T7gqRD6J7UyZikDxH9kwTOpkpzCMAwBpKKruTcxBVBRnppruQGt4r__mGQYjhIKW2Q"
    ),
    publicKey: sodium.from_base64(
      "ZKcwjAMAaSiq7k3MQVQUZ6aa7kBreK__5hkGI4SCltk"
    ),
    keyType: "ed25519",
  };
};

export const getKeyPairsA = (): KeyPairs => {
  return {
    sign: {
      privateKey:
        "g3dtwb9XzhSzZGkxTfg11t1KEIb4D8rO7K54R6dnxArvgg_OzZ2GgREtG7F5LvNp3MS8p9vsio4r6Mq7SZDEgw",
      publicKey: "74IPzs2dhoERLRuxeS7zadzEvKfb7IqOK-jKu0mQxIM",
      keyType: "ed25519",
    },
    box: {
      privateKey: "JZFX98tVGO7tnagDgwkKUdnoKh5EI7FlYh8j2E2UtR4",
      publicKey: "wevxDsZ-L7wpy3ePZcQNfG8WDh0wB0d27phr5OMdLwI",
      keyType: "x25519",
    },
  };
};

export const getKeyPairsB = (): KeyPairs => {
  return {
    sign: {
      privateKey:
        "JyI15wGDAmduTUfhmzkIYePqFdPaEG3QLUdRrkqC1dAxMOGpUgx-VMPQJqv4pI_UxYIgRiqzYsFpd9TbR2LS1g",
      publicKey: "MTDhqVIMflTD0Car-KSP1MWCIEYqs2LBaXfU20di0tY",
      keyType: "ed25519",
    },
    box: {
      privateKey: "fec_R3XDXUW-w6NoWeygnf9NDFzOlJM2QNczm0_ztG8",
      publicKey: "b_skeL8qudNQji-HuOldPNFDzYSBENNqmFMlawhtrHg",
      keyType: "x25519",
    },
  };
};

export const getKeyPairsC = (): KeyPairs => {
  return {
    sign: {
      privateKey:
        "W4EYSNTXQqkbv6_P1MF6T7gqRD6J7UyZikDxH9kwTOpkpzCMAwBpKKruTcxBVBRnppruQGt4r__mGQYjhIKW2Q",
      publicKey: "ZKcwjAMAaSiq7k3MQVQUZ6aa7kBreK__5hkGI4SCltk",
      keyType: "ed25519",
    },
    box: {
      privateKey: "Z5apAnVoYXmKbbF8xXdxW2lz6I8TV8KbiSmwQLcJ24I",
      publicKey: "0hUuO22MoTa8X65ZvpR9KcfUwF_B2aIvLORPjuaofBg",
      keyType: "x25519",
    },
  };
};
