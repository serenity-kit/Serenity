import { prisma } from "../prisma";
import {
  crypto_sign_keypair,
  crypto_box_keypair,
  crypto_sign_detached,
  crypto_secretbox_easy,
  // crypto_secretbox_NONCEBYTES, // FIXME: this is not exported
  randombytes_buf,
  StringKeyPair,
} from "@serenity-tools/libsodium";
import { crypto_secretbox_NONCEBYTES } from "libsodium-wrappers-sumo";
import { createDevice, CreateDeviceResponseType } from "./createDevice";

type Params = {
  userId: string;
};

type CreateRecoveryDeviceResponse = {
  masterDevice: CreateDeviceResponseType;
  recoveryDevice: {
    signingKeyPair: StringKeyPair;
    encryptionKeyPair: StringKeyPair;
    nonce: string;
    signatureForRecoveryDeviceSigningPublicKey: string;
    signedMasterDevicePublicKey: string;
    cipherText: string;
  };
};

export async function createMasterAndRecoveryDevice({
  userId,
}: Params): Promise<CreateRecoveryDeviceResponse> {
  // remove old recovery device
  await prisma.recoveryDevice.deleteMany({
    where: {
      userId,
    },
  });
  const masterDevice = await createDevice({ userId });

  // Note: The user should aleady be verified to exist by this point
  const signingKeyPair = await crypto_sign_keypair();
  const encryptionKeyPair = await crypto_box_keypair();

  const signatureForRecoveryDeviceSigningPublicKeyString = `${signingKeyPair.publicKey}`;
  const signatureForRecoveryDeviceSigningPublicKey = await crypto_sign_detached(
    signatureForRecoveryDeviceSigningPublicKeyString,
    signingKeyPair.privateKey
  );

  // convert the signing and encryption private keys into a ciphertext
  const nonce = await randombytes_buf(crypto_secretbox_NONCEBYTES);
  const rawKeyPairData = JSON.stringify({
    signingPublicKey: signingKeyPair.publicKey,
    encryptionPublicKey: encryptionKeyPair.publicKey,
  });
  const cipherText = await crypto_secretbox_easy(
    rawKeyPairData,
    nonce,
    encryptionKeyPair.privateKey
  );

  const signedMasterDevicePublicKey = crypto_sign_detached(
    masterDevice.signingKeyPair.publicKey,
    signingKeyPair.privateKey
  );

  await prisma.recoveryDevice.create({
    data: {
      userId,
      deviceSigningPublicKey: signingKeyPair.publicKey,
      deviceSigningKeyType: signingKeyPair.keyType,
      signatureForRecoveryDeviceSigningPublicKey,
      signedMasterDevicePublicKey,
      nonce,
      cipherText,
    },
  });

  return {
    masterDevice,
    recoveryDevice: {
      signingKeyPair,
      encryptionKeyPair,
      nonce,
      signatureForRecoveryDeviceSigningPublicKey,
      signedMasterDevicePublicKey,
      cipherText,
    },
  };
}

/*
note to self:

* What device information do we want to store? Is it important?
* How to we create a recovery device? Is there only one recovery device?
* Should we store the key type? yes

*/

/*
```prisma
model RecoveryDevice {
  // contains the device signingPrivateKey and encryptionPrivateKey
  // can be decrypted using the key exposed to the user during recovery setup process
  ciphertext                                 String
  // nonce to decrypt the ciphertext
  nonce                                      String
  device                                     Device @relation(fields: [deviceSigningPublicKey], references: [signingPublicKey])
  deviceSigningPublicKey                     String @id
  deviceSigningKeyType                       String @default("invalid")
  user                                       User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId                                     String @unique
  // this cross signing makes sure that the master device and recovery device are linked and verifyable in both directions
  // signed by the user's recovery device
  signatureForMasterDeviceSigningPublicKey   String
  // signed by the user's master device
  signatureForRecoveryDeviceSigningPublicKey String

}
```
*/
