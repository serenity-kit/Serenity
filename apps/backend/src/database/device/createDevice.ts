import { prisma } from "../prisma";
import {
  crypto_sign_keypair,
  crypto_box_keypair,
  crypto_sign_detached,
  StringKeyPair,
} from "@serenity-tools/libsodium";

type Params = {
  userId: string;
};

export type CreateDeviceResponseType = {
  id: string;
  signingKeyPair: StringKeyPair;
  encryptionKeyPair: StringKeyPair;
  keyPairSignature: string;
};

export async function createDevice({
  userId,
}: Params): Promise<CreateDeviceResponseType> {
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
      signingKeyType: signingKeyPair.keyType,
      signingPublicKey: signingKeyPair.publicKey,
      encryptionPublicKey: encryptionKeyPair.publicKey,
      encryptionKeyType: signingKeyPair.keyType,
      encryptionPublicKeySignature: keyPairSignature,
      // what is userForMaster?
    },
  });

  return {
    id: device.id,
    signingKeyPair,
    encryptionKeyPair,
    keyPairSignature: keyPairSignature,
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
model Device {
    signingPublicKey             String          @id @unique
    encryptionPublicKey          String
    encryptionPublicKeySignature String
    // can't be mandatory since we need to create the device
    user                         User?           @relation(fields: [userId], references: [id], onDelete: Cascade)
    userId                       String?
    recoveryDevice               RecoveryDevice?
    userForMaster                User?           @relation("masterDevice")
  }
```
*/
