import { shareDocumentDeviceEncryptionPublicKeyDomainContext } from "@serenity-kit/document-chain";
import { userDeviceEncryptionPublicKeyDomainContext } from "@serenity-kit/user-chain";
import sodium from "react-native-libsodium";
import { LocalDevice } from "../types";

export const createDevice = (type: "user" | "share-document"): LocalDevice => {
  const context =
    type === "user"
      ? userDeviceEncryptionPublicKeyDomainContext
      : shareDocumentDeviceEncryptionPublicKeyDomainContext;
  const signingKeyPair = sodium.crypto_sign_keypair();
  const encryptionKeyPair = sodium.crypto_box_keypair();
  const encryptionPublicKeySignature = sodium.crypto_sign_detached(
    context + sodium.to_base64(encryptionKeyPair.publicKey),
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
