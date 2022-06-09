import { prisma } from "../prisma";
import {
  crypto_sign_keypair,
  crypto_box_keypair,
  crypto_sign_detached,
} from "@serenity-tools/libsodium";
import { Device } from "../../types/device";

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

  return {
    ...device,
    signingPrivateKey: signingKeyPair.privateKey,
    encryptionPrivateKey: encryptionKeyPair.privateKey,
  } as Device;
}
