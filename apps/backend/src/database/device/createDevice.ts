import { prisma } from "../prisma";
import {
  crypto_sign_keypair,
  crypto_box_keypair,
  crypto_sign_detached,
  to_base64,
  crypto_secretbox_easy,
  randombytes_buf,
} from "@serenity-tools/libsodium";
import { Device } from "../../types/device";
import { crypto_secretbox_NONCEBYTES } from "libsodium-wrappers";

// TODO: provide browser/os/location identifiers
// so user can look through devices later to know which ones
// look sketching and which ones they feel safe deleting
// os?: string; // eg android, ios, windows, mac, linux
// osVersion?: string;
// browser?: string; // eg chrome, firefox, safari
// browserVersion?: string;
// ipAddress: string; // to estimate the location
type Params = {
  userId: string;
};

export async function createDevice({ userId }: Params): Promise<Device> {
  // Note: The user should aleady be verified to exist by this point
  const signingKeyPair = await crypto_sign_keypair();
  const encryptionKeyPair = await crypto_box_keypair();

  const keyPairSignatureString = JSON.stringify({
    signingPublicKey: signingKeyPair.publicKey,
    encryptionPublicKey: encryptionKeyPair.publicKey,
  });
  const keyPairSignature = await crypto_sign_detached(
    keyPairSignatureString,
    signingKeyPair.privateKey
  );

  const device = await prisma.device.create({
    data: {
      userId,
      signingPublicKey: signingKeyPair.publicKey,
      signingKeyType: signingKeyPair.keyType,
      encryptionPublicKey: encryptionKeyPair.publicKey,
      encryptionKeyType: encryptionKeyPair.keyType,
      encryptionPublicKeySignature: keyPairSignature,
      // what is userForMain?
    },
  });

  const nonce = await randombytes_buf(crypto_secretbox_NONCEBYTES);
  const rawKeyPairData = JSON.stringify({
    signingPublicKey: device.signingPublicKey,
    encryptionPublicKey: device.encryptionPublicKey,
  });
  const base64EncodedPairData = to_base64(rawKeyPairData);
  const cipherText = crypto_secretbox_easy(
    base64EncodedPairData,
    nonce,
    encryptionKeyPair.privateKey!
  );

  return {
    ...device,
    signingPrivateKey: signingKeyPair.privateKey,
    encryptionPrivateKey: encryptionKeyPair.privateKey,
    ciphertext: cipherText,
    nonce,
  } as Device;
}
