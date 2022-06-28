import { createAndEncryptDevice } from "@serenity-tools/common";
import { Login, Registration } from "@serenity-tools/opaque-server";
import * as sodium from "@serenity-tools/libsodium";
import {
  finishLogin,
  finishRegistration,
  startLogin,
  startRegistration,
} from "../../utils/opaque";
import { prisma } from "../prisma";
import { createSession } from "../authentication/createSession";
import { addDays } from "../../utils/addDays/addDays";

type Params = {
  id: string;
  username: string;
};

export default async function createUserWithWorkspace({
  id,
  username,
}: Params) {
  // setup server registration opaque
  const registration = new Registration();
  const challenge = registration.start("12345689");
  const { response, registrationId } = startRegistration({
    username,
    challenge: sodium.to_base64(challenge),
  });
  const message = registration.finish(sodium.from_base64(response));
  const exportKey = sodium.to_base64(registration.getExportKey());
  const { envelope } = finishRegistration({
    registrationId,
    message: sodium.to_base64(message),
  });
  const mainDevice = await createAndEncryptDevice(exportKey);

  const result = await prisma.$transaction(async (prisma) => {
    const device = await prisma.device.create({
      data: {
        signingPublicKey: mainDevice.signingPublicKey,
        encryptionPublicKey: mainDevice.encryptionPublicKey,
        encryptionPublicKeySignature: mainDevice.encryptionPublicKeySignature,
      },
    });

    const user = await prisma.user.create({
      data: {
        username,
        opaqueEnvelope: envelope,
        mainDeviceCiphertext: mainDevice.ciphertext,
        mainDeviceNonce: mainDevice.nonce,
        mainDeviceSigningPublicKey: mainDevice.signingPublicKey,
        mainDeviceEncryptionKeySalt: mainDevice.encryptionKeySalt,
        devices: {
          connect: {
            signingPublicKey: device.signingPublicKey,
          },
        },
      },
    });

    await prisma.workspace.create({
      data: {
        id,
        name: "My Workspace",
        idSignature: "TODO",
        usersToWorkspaces: {
          create: {
            userId: user.id,
            isAdmin: true,
          },
        },
      },
    });
    return { user, device };
  });

  const login = new Login();
  const loginChallenge = login.start("12345689");
  const { message: loginMessage, loginId } = startLogin({
    envelope,
    username,
    challenge: sodium.to_base64(loginChallenge),
  });
  const loginStartResponse = login.finish(sodium.from_base64(loginMessage));

  const { sessionKey } = finishLogin({
    loginId,
    message: sodium.to_base64(loginStartResponse),
  });

  const session = await createSession({
    username,
    sessionKey,
    expiresAt: addDays(new Date(), 30),
  });

  return { ...result, session, sessionKey };
}
