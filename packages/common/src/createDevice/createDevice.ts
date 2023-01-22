import sodium from "react-native-libsodium";
import { LocalDevice } from "../types";

export const createDevice = () => {
  const signingKeyPair = sodium.crypto_sign_keypair();
  const encryptionKeyPair = sodium.crypto_box_keypair();
  const encryptionPublicKeySignature = sodium.crypto_sign_detached(
    encryptionKeyPair.publicKey,
    signingKeyPair.privateKey
  );
  const device: LocalDevice = {
    signingPublicKey: sodium.to_base64(signingKeyPair.publicKey),
    signingPrivateKey: sodium.to_base64(signingKeyPair.privateKey),
    encryptionPublicKey: sodium.to_base64(encryptionKeyPair.publicKey),
    encryptionPrivateKey: sodium.to_base64(encryptionKeyPair.privateKey),
    encryptionPublicKeySignature: sodium.to_base64(
      encryptionPublicKeySignature
    ),
  };
  return device;
};
