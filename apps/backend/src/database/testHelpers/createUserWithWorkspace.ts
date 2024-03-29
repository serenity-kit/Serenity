import * as documentChain from "@serenity-kit/document-chain";
import { client, ready as opaqueReady, server } from "@serenity-kit/opaque";
import * as userChain from "@serenity-kit/user-chain";
import * as workspaceChain from "@serenity-kit/workspace-chain";
import * as workspaceMemberDevicesProofUtil from "@serenity-kit/workspace-member-devices-proof";
import {
  createAndEncryptMainDevice,
  createAndEncryptWorkspaceKeyForDevice,
  createDocumentTitleKey,
  createIntroductionDocumentSnapshot,
  createSnapshotKey,
  encryptDocumentTitleByKey,
  encryptFolderName,
  encryptWorkspaceInfo,
  encryptWorkspaceKeyForDevice,
  folderDerivedKeyContext,
  generateId,
  snapshotDerivedKeyContext,
} from "@serenity-tools/common";
import { createSubkeyId } from "@serenity-tools/common/src/kdfDeriveFromKey/kdfDeriveFromKey";
import sodium from "react-native-libsodium";
import { Prisma } from "../../../prisma/generated/output";
import { createInitialWorkspaceStructure } from "../../database/workspace/createInitialWorkspaceStructure";
import { attachDeviceToWorkspaces } from "../device/attachDeviceToWorkspaces";
import { prisma } from "../prisma";
import { createDeviceAndLogin } from "./createDeviceAndLogin";

type Params = {
  username: string;
  password?: string;
};

export default async function createUserWithWorkspace({
  username,
  password,
}: Params) {
  await opaqueReady;
  let thePassword = "12345689";
  if (password) {
    thePassword = password;
  }

  if (!process.env.OPAQUE_SERVER_SETUP) {
    throw new Error("Missing process.env.OPAQUE_SERVER_SETUP");
  }

  const clientRegistrationStartResult = client.startRegistration({
    password: thePassword,
  });
  const serverRegistrationStartResult = server.createRegistrationResponse({
    userIdentifier: username,
    registrationRequest: clientRegistrationStartResult.registrationRequest,
    serverSetup: process.env.OPAQUE_SERVER_SETUP,
  });
  const clientRegistrationFinishResult = client.finishRegistration({
    clientRegistrationState:
      clientRegistrationStartResult.clientRegistrationState,
    password: thePassword,
    registrationResponse: serverRegistrationStartResult.registrationResponse,
  });
  const exportKey = clientRegistrationFinishResult.exportKey;

  const mainDevice = createAndEncryptMainDevice(exportKey);

  const device = await prisma.device.create({
    data: {
      signingPublicKey: mainDevice.signingPublicKey,
      encryptionPublicKey: mainDevice.encryptionPublicKey,
      encryptionPublicKeySignature: mainDevice.encryptionPublicKeySignature,
    },
  });

  const createChainEvent = userChain.createUserChain({
    authorKeyPair: {
      privateKey: mainDevice.signingPrivateKey,
      publicKey: mainDevice.signingPublicKey,
    },
    email: username,
    encryptionPublicKey: mainDevice.encryptionPublicKey,
  });
  const userChainState = userChain.resolveState({
    events: [createChainEvent],
    knownVersion: userChain.version,
  });

  const result = await prisma.$transaction(
    async (prisma) => {
      const user = await prisma.user.create({
        data: {
          id: userChainState.currentState.id,
          username,
          registrationRecord: clientRegistrationFinishResult.registrationRecord,
          mainDeviceCiphertext: mainDevice.ciphertext,
          mainDeviceNonce: mainDevice.nonce,
          mainDeviceSigningPublicKey: mainDevice.signingPublicKey,
          devices: {
            connect: {
              signingPublicKey: device.signingPublicKey,
            },
          },
          chain: {
            create: {
              content: createChainEvent,
              state: userChainState.currentState,
              position: 0,
            },
          },
        },
      });
      return {
        user,
        encryptionPrivateKey: mainDevice.encryptionPrivateKey,
        signingPrivateKey: mainDevice.signingPrivateKey,
      };
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  );

  const folderId = generateId();
  const workspaceKeyId = generateId();
  const documentName = "Introduction";
  const user = result.user;

  const createWorkspaceChainEvent = workspaceChain.createChain({
    privateKey: mainDevice.signingPrivateKey,
    publicKey: mainDevice.signingPublicKey,
  });

  const workspaceChainState = workspaceChain.resolveState([
    createWorkspaceChainEvent,
  ]);

  const { nonce, ciphertext, workspaceKey } =
    createAndEncryptWorkspaceKeyForDevice({
      receiverDeviceEncryptionPublicKey: mainDevice.encryptionPublicKey,
      creatorDeviceEncryptionPrivateKey: mainDevice.encryptionPrivateKey,
      workspaceKeyId,
      workspaceId: createWorkspaceChainEvent.transaction.id,
    });
  const folderName = "Getting Started";

  const workspaceMemberDevicesProof =
    workspaceMemberDevicesProofUtil.createWorkspaceMemberDevicesProof({
      authorKeyPair: {
        privateKey: sodium.from_base64(mainDevice.signingPrivateKey),
        publicKey: sodium.from_base64(mainDevice.signingPublicKey),
        keyType: "ed25519",
      },
      workspaceMemberDevicesProofData: {
        clock: 0,
        userChainHashes: {
          [userChainState.currentState.id]:
            userChainState.currentState.eventHash,
        },
        workspaceChainHash: workspaceChainState.lastEventHash,
      },
    });

  const folderSubkeyId = createSubkeyId();
  const encryptedFolderResult = encryptFolderName({
    name: folderName,
    parentKey: workspaceKey,
    folderId,
    subkeyId: folderSubkeyId,
    workspaceId: createWorkspaceChainEvent.transaction.id,
    keyDerivationTrace: {
      workspaceKeyId,
      trace: [
        {
          entryId: folderId,
          parentId: null,
          subkeyId: folderSubkeyId,
          context: folderDerivedKeyContext,
        },
      ],
    },
    workspaceMemberDevicesProof,
    device: mainDevice,
  });

  const folderKey = encryptedFolderResult.folderSubkey;
  const snapshotKey = createSnapshotKey({
    folderKey,
  });
  const documentTitleKeyResult = createDocumentTitleKey({
    snapshotKey: snapshotKey.key,
  });
  const documentTitleKey = documentTitleKeyResult.key;

  const createDocumentChainEvent = documentChain.createDocumentChain({
    authorKeyPair: {
      privateKey: mainDevice.signingPrivateKey,
      publicKey: mainDevice.signingPublicKey,
    },
  });

  const encryptedDocumentTitleResult = encryptDocumentTitleByKey({
    title: documentName,
    key: documentTitleKey,
    documentId: createDocumentChainEvent.transaction.id,
    workspaceId: createWorkspaceChainEvent.transaction.id,
    workspaceMemberDevicesProof,
    activeDevice: mainDevice,
  });

  const snapshotId = generateId();

  const documentChainState = documentChain.resolveState({
    events: [createDocumentChainEvent],
    knownVersion: documentChain.version,
  });

  const snapshot = createIntroductionDocumentSnapshot({
    documentId: createDocumentChainEvent.transaction.id,
    snapshotEncryptionKey: sodium.from_base64(snapshotKey.key),
    documentChainEventHash: documentChainState.currentState.eventHash,
    workspaceMemberDevicesProof,
    keyDerivationTrace: {
      workspaceKeyId,
      trace: [
        {
          entryId: folderId,
          parentId: null,
          subkeyId: encryptedFolderResult.folderSubkeyId,
          context: folderDerivedKeyContext,
        },
        {
          entryId: snapshotId,
          parentId: folderId,
          subkeyId: snapshotKey.subkeyId,
          context: snapshotDerivedKeyContext,
        },
      ],
    },
    device: mainDevice,
  });

  const workspaceInfo = await encryptWorkspaceInfo({
    name: "My Workspace",
    key: workspaceKey,
    device: mainDevice,
    workspaceId: createWorkspaceChainEvent.transaction.id,
    workspaceKeyId,
    workspaceMemberDevicesProof,
  });

  const createWorkspaceResult = await createInitialWorkspaceStructure({
    userId: user.id,
    workspace: {
      id: createWorkspaceChainEvent.transaction.id,
      infoCiphertext: workspaceInfo.ciphertext,
      infoNonce: workspaceInfo.nonce,
      infoSignature: workspaceInfo.signature,
      workspaceKeyId,
      deviceWorkspaceKeyBoxes: [
        {
          deviceSigningPublicKey: device.signingPublicKey,
          nonce,
          ciphertext,
        },
      ],
    },
    workspaceMemberDevicesProof,
    workspaceChainEvent: createWorkspaceChainEvent,
    folder: {
      id: folderId,
      signature: encryptedFolderResult.signature,
      nameCiphertext: encryptedFolderResult.ciphertext,
      nameNonce: encryptedFolderResult.nonce,
      keyDerivationTrace: {
        workspaceKeyId,
        trace: [
          {
            entryId: folderId,
            subkeyId: encryptedFolderResult.folderSubkeyId,
            parentId: null,
            context: folderDerivedKeyContext,
          },
        ],
      },
    },
    document: {
      nameCiphertext: encryptedDocumentTitleResult.ciphertext,
      nameNonce: encryptedDocumentTitleResult.publicNonce,
      nameSignature: encryptedDocumentTitleResult.signature,
      subkeyId: documentTitleKeyResult.subkeyId,
      // @ts-expect-error due the documentTitleData missing in additionalServerData
      snapshot,
    },
    creatorDeviceSigningPublicKey: device.signingPublicKey,
    userMainDeviceSigningPublicKey: mainDevice.signingPublicKey,
    documentChainEvent: createDocumentChainEvent,
  });

  const { session, sessionKey, webDevice } = await createDeviceAndLogin({
    username,
    password: thePassword,
    envelope: clientRegistrationFinishResult.registrationRecord,
    mainDevice,
  });

  const webDeviceWorkspaceKeyBox = encryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey: webDevice.encryptionPublicKey,
    creatorDeviceEncryptionPrivateKey: mainDevice.encryptionPrivateKey,
    workspaceKey,
    workspaceKeyId,
    workspaceId: createWorkspaceChainEvent.transaction.id,
  });

  await attachDeviceToWorkspaces({
    userId: user.id,
    receiverDeviceSigningPublicKey: webDevice.signingPublicKey,
    creatorDeviceSigningPublicKey: mainDevice.signingPublicKey,
    workspaceKeyBoxes: [
      {
        workspaceId: createWorkspaceResult.workspace.id,
        workspaceKeyDevicePairs: [
          {
            workspaceKeyId:
              createWorkspaceResult.workspace.currentWorkspaceKey?.id!,
            nonce: webDeviceWorkspaceKeyBox.nonce,
            ciphertext: webDeviceWorkspaceKeyBox.ciphertext,
          },
        ],
      },
    ],
  });

  if (createWorkspaceResult.workspace.currentWorkspaceKey?.workspaceKeyBox) {
    createWorkspaceResult.workspace.currentWorkspaceKey.workspaceKeyBox.creatorDevice =
      mainDevice;
  }

  return {
    ...result,
    session,
    sessionKey,
    device,
    mainDevice: { ...mainDevice, userId: user.id, createdAt: new Date() },
    deviceEncryptionPrivateKey: mainDevice.encryptionPrivateKey,
    deviceSigningPrivateKey: mainDevice.signingPrivateKey,
    webDevice,
    user,
    envelope: clientRegistrationFinishResult.registrationRecord,
    workspace: createWorkspaceResult.workspace,
    folder: createWorkspaceResult.folder,
    document: createWorkspaceResult.document,
    snapshot: createWorkspaceResult.snapshot,
    snapshotKey,
    workspaceKey,
    workspaceKeyId,
  };
}
