import {
  createAndEncryptDevice,
  createIntroductionDocumentSnapshot,
} from "@serenity-tools/common";
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
import { v4 as uuidv4 } from "uuid";
import { createInitialWorkspaceStructure } from "../../database/workspace/createInitialWorkspaceStructure";
import { createAeadKeyAndCipherTextForDevice } from "../../../test/helpers/device/createAeadKeyAndCipherTextForDevice";

type Params = {
  id: string;
  username: string;
  password?: string;
};

export default async function createUserWithWorkspace({
  id,
  username,
  password,
}: Params) {
  let thePassword = "12345689";
  if (password) {
    thePassword = password;
  }
  // setup server registration opaque
  const registration = new Registration();
  const challenge = registration.start(thePassword);
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
    return { user, device };
  });

  const documentId = uuidv4();
  const documentEncryptionKey = sodium.from_base64(
    "cksJKBDshtfjXJ0GdwKzHvkLxDp7WYYmdJkU1qPgM-0"
  );
  const documentSnapshot = await createIntroductionDocumentSnapshot({
    documentId,
    documentEncryptionKey,
  });

  const user = result.user;
  const device = result.device;
  const deviceEncryptionPublicKey = device.encryptionPublicKey;
  const { nonce, ciphertext } = await createAeadKeyAndCipherTextForDevice({
    deviceEncryptionPublicKey,
  });
  const createWorkspaceResult = await createInitialWorkspaceStructure({
    userId: user.id,
    workspaceId: id,
    workspaceName: "My Workspace",
    deviceSigningPublicKey: device.signingPublicKey,
    deviceAeadNonce: nonce,
    deviceAeadCiphertext: ciphertext,
    folderId: uuidv4(),
    folderIdSignature: uuidv4(),
    folderName: "Getting Started",
    documentId,
    documentName: "Introduction",
    documentSnapshot,
  });

  const login = new Login();
  const loginChallenge = login.start(thePassword);
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

  return {
    ...result,
    session,
    sessionKey,
    workspace: createWorkspaceResult.workspace,
    folder: createWorkspaceResult.folder,
    document: createWorkspaceResult.document,
  };
}
