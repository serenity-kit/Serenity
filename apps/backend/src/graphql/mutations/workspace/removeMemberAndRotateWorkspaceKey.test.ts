import * as workspaceChain from "@serenity-kit/workspace-chain";
import {
  decryptFolderName,
  deriveKeysFromKeyDerivationTrace,
  deriveSessionAuthorization,
  encryptWorkspaceKeyForDevice,
  generateId,
} from "@serenity-tools/common";
import { gql } from "graphql-request";
import sodium from "react-native-libsodium";
import { Role } from "../../../../prisma/generated/output";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { attachDeviceToWorkspaces } from "../../../../test/helpers/device/attachDeviceToWorkspaces";
import { getWorkspaceKeyForWorkspaceAndDevice } from "../../../../test/helpers/device/getWorkspaceKeyForWorkspaceAndDevice";
import { getRootFolders } from "../../../../test/helpers/folder/getRootFolders";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { acceptWorkspaceInvitation } from "../../../../test/helpers/workspace/acceptWorkspaceInvitation";
import { createWorkspaceInvitation } from "../../../../test/helpers/workspace/createWorkspaceInvitation";
import { getLastWorkspaceChainEvent } from "../../../../test/helpers/workspace/getLastWorkspaceChainEvent";
import { getWorkspace } from "../../../../test/helpers/workspace/getWorkspace";
import { removeMemberAndRotateWorkspaceKey } from "../../../../test/helpers/workspace/removeMemberAndRotateWorkspaceKey";
import { prisma } from "../../../database/prisma";
import { createDeviceAndLogin } from "../../../database/testHelpers/createDeviceAndLogin";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";
import { getWorkspaceMemberDevicesProof } from "../../../database/workspace/getWorkspaceMemberDevicesProof";
import { WorkspaceDeviceParing } from "../../../types/workspaceDevice";

const graphql = setupGraphql();
let userData1: any = null;
let userData2: any = null;
const password1 = generateId();
const password2 = generateId();

beforeEach(async () => {
  await deleteAllRecords();
  userData1 = await createUserWithWorkspace({
    username: `${generateId()}@example.com`,
    password: password1,
  });
  userData2 = await createUserWithWorkspace({
    username: `${generateId()}@example.com`,
    password: password2,
  });
});

test("user cannot remove self", async () => {
  const workspaceKey = getWorkspaceKeyForWorkspaceAndDevice({
    device: userData1.device,
    deviceEncryptionPrivateKey: userData1.deviceEncryptionPrivateKey,
    workspace: userData1.workspace,
  });
  const loginResult = await createDeviceAndLogin({
    username: userData1.user.username,
    envelope: userData1.envelope,
    password: password1,
    mainDevice: userData1.mainDevice,
  });
  const newDevice = loginResult.webDevice;
  const { ciphertext, nonce } = encryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey: newDevice.encryptionPublicKey,
    creatorDeviceEncryptionPrivateKey: userData1.deviceEncryptionPrivateKey,
    workspaceKey,
    workspaceId: userData1.workspace.id,
    workspaceKeyId: userData1.workspace.currentWorkspaceKey.id,
  });
  const deviceWorkspaceKeyBoxes: WorkspaceDeviceParing[] = [
    {
      ciphertext,
      nonce,
      receiverDeviceSigningPublicKey: newDevice.signingPublicKey,
    },
  ];

  const { lastChainEntry } = await getLastWorkspaceChainEvent({
    workspaceId: userData1.workspace.id,
  });
  const removeMemberEvent = workspaceChain.removeMember(
    workspaceChain.hashTransaction(lastChainEntry.transaction),
    {
      keyType: "ed25519",
      privateKey: sodium.from_base64(userData1.mainDevice.signingPrivateKey),
      publicKey: sodium.from_base64(userData1.mainDevice.signingPublicKey),
    },
    userData1.mainDevice.signingPublicKey
  );

  await expect(
    (async () =>
      await removeMemberAndRotateWorkspaceKey({
        graphql,
        workspaceId: userData1.workspace.id,
        workspaceKeyId: userData1.workspace.currentWorkspaceKey.id,
        creatorDeviceSigningPublicKey: userData1.device.signingPublicKey,
        deviceWorkspaceKeyBoxes,
        authorizationHeader: deriveSessionAuthorization({
          sessionKey: userData1.sessionKey,
        }).authorization,
        workspaceChainEvent: removeMemberEvent,
        mainDevice: userData1.mainDevice,
        userIdToRemove: userData1.user.id,
      }))()
  ).rejects.toThrowError(/BAD_USER_INPUT/);
});

test("user cannot revoke own main device", async () => {
  const workspaceKey = getWorkspaceKeyForWorkspaceAndDevice({
    device: userData1.device,
    deviceEncryptionPrivateKey: userData1.deviceEncryptionPrivateKey,
    workspace: userData1.workspace,
  });
  const workspaceInvitationResult = await createWorkspaceInvitation({
    graphql,
    role: Role.VIEWER,
    workspaceId: userData1.workspace.id,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
    mainDevice: userData1.mainDevice,
  });
  const invitationId =
    workspaceInvitationResult.createWorkspaceInvitation.workspaceInvitation.id;
  await acceptWorkspaceInvitation({
    graphql,
    invitationId,
    inviteeMainDevice: userData2.mainDevice,
    invitationSigningKeyPairSeed:
      workspaceInvitationResult.invitationSigningKeyPairSeed,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData2.sessionKey,
    }).authorization,
  });

  const loginResult = await createDeviceAndLogin({
    username: userData1.user.username,
    envelope: userData1.envelope,
    password: password1,
    mainDevice: userData1.mainDevice,
  });
  const newDevice = loginResult.webDevice;
  const { ciphertext, nonce } = encryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey: newDevice.encryptionPublicKey,
    creatorDeviceEncryptionPrivateKey: userData1.deviceEncryptionPrivateKey,
    workspaceKey,
    workspaceId: userData1.workspace.id,
    workspaceKeyId: userData1.workspace.currentWorkspaceKey.id,
  });
  const deviceWorkspaceKeyBoxes: WorkspaceDeviceParing[] = [
    {
      ciphertext,
      nonce,
      receiverDeviceSigningPublicKey: newDevice.signingPublicKey,
    },
  ];

  const { lastChainEntry } = await getLastWorkspaceChainEvent({
    workspaceId: userData1.workspace.id,
  });
  const removeMemberEvent = workspaceChain.removeMember(
    workspaceChain.hashTransaction(lastChainEntry.transaction),
    {
      keyType: "ed25519",
      privateKey: sodium.from_base64(userData1.mainDevice.signingPrivateKey),
      publicKey: sodium.from_base64(userData1.mainDevice.signingPublicKey),
    },
    userData2.mainDevice.signingPublicKey
  );

  await expect(
    (async () =>
      await removeMemberAndRotateWorkspaceKey({
        graphql,
        workspaceId: userData1.workspace.id,
        workspaceKeyId: userData1.workspace.currentWorkspaceKey.id,
        creatorDeviceSigningPublicKey: userData1.device.signingPublicKey,
        deviceWorkspaceKeyBoxes,
        authorizationHeader: deriveSessionAuthorization({
          sessionKey: userData1.sessionKey,
        }).authorization,
        workspaceChainEvent: removeMemberEvent,
        mainDevice: userData1.mainDevice,
        userIdToRemove: userData2.user.id,
      }))()
  ).rejects.toThrow();
});

test("user can remove another user", async () => {
  const workspaceKey = getWorkspaceKeyForWorkspaceAndDevice({
    device: userData1.device,
    deviceEncryptionPrivateKey: userData1.deviceEncryptionPrivateKey,
    workspace: userData1.workspace,
  });

  const workspaceInvitationResult = await createWorkspaceInvitation({
    graphql,
    role: Role.VIEWER,
    workspaceId: userData1.workspace.id,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
    mainDevice: userData1.mainDevice,
  });
  const invitationId =
    workspaceInvitationResult.createWorkspaceInvitation.workspaceInvitation.id;
  await acceptWorkspaceInvitation({
    graphql,
    invitationId,
    inviteeMainDevice: userData2.mainDevice,
    invitationSigningKeyPairSeed:
      workspaceInvitationResult.invitationSigningKeyPairSeed,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData2.sessionKey,
    }).authorization,
  });
  const user2WebDeviceKeyBox = encryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey: userData1.webDevice.signingPublicKey,
    creatorDeviceEncryptionPrivateKey: userData1.webDevice.encryptionPrivateKey,
    workspaceKey,
    workspaceId: userData1.workspace.id,
    workspaceKeyId: userData1.workspace.currentWorkspaceKey.id,
  });
  const user2MainDeviceKeyBox = encryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey: userData1.mainDevice.signingPublicKey,
    creatorDeviceEncryptionPrivateKey:
      userData1.mainDevice.encryptionPrivateKey,
    workspaceKey,
    workspaceId: userData1.workspace.id,
    workspaceKeyId: userData1.workspace.currentWorkspaceKey.id,
  });
  const user1WebDeviceDeviceKeyBox = encryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey: userData1.webDevice.signingPublicKey,
    creatorDeviceEncryptionPrivateKey: userData1.webDevice.encryptionPrivateKey,
    workspaceKey,
    workspaceId: userData1.workspace.id,
    workspaceKeyId: userData1.workspace.currentWorkspaceKey.id,
  });
  const approvedDeviceKeyBoxes = [
    {
      workspaceId: userData1.workspace.id,
      workspaceKeyDevicePairs: [
        // user2 webDevice
        {
          workspaceKeyId: userData1.workspace.currentWorkspaceKey.id,
          nonce: user2WebDeviceKeyBox.nonce,
          ciphertext: user2WebDeviceKeyBox.nonce,
        },
        // user2 mainDevice
        {
          workspaceKeyId: userData1.workspace.currentWorkspaceKey.id,
          nonce: user2MainDeviceKeyBox.nonce,
          ciphertext: user2MainDeviceKeyBox.nonce,
        },
        // user1 webDevice
        {
          workspaceKeyId: userData1.workspace.currentWorkspaceKey.id,
          nonce: user1WebDeviceDeviceKeyBox.nonce,
          ciphertext: user1WebDeviceDeviceKeyBox.nonce,
        },
      ],
    },
  ];
  await attachDeviceToWorkspaces({
    graphql,
    deviceSigningPublicKey: userData2.device.signingPublicKey,
    creatorDeviceSigningPublicKey: userData1.device.signingPublicKey,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
    deviceWorkspaceKeyBoxes: approvedDeviceKeyBoxes,
  });

  const newWorkspaceKey = {
    id: generateId(),
    workspaceKey: sodium.to_base64(sodium.crypto_kdf_keygen()),
  };

  const user1MainDeviceGen1 = encryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey: userData1.mainDevice.signingPublicKey,
    creatorDeviceEncryptionPrivateKey:
      userData1.mainDevice.encryptionPrivateKey,
    workspaceId: userData1.workspace.id,
    workspaceKey: newWorkspaceKey.workspaceKey,
    workspaceKeyId: newWorkspaceKey.id,
  });
  const user1WebDeviceGen1 = encryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey: userData1.webDevice.signingPublicKey,
    creatorDeviceEncryptionPrivateKey:
      userData1.mainDevice.encryptionPrivateKey,
    workspaceId: userData1.workspace.id,
    workspaceKey: newWorkspaceKey.workspaceKey,
    workspaceKeyId: newWorkspaceKey.id,
  });
  const workspaceUsersBefore = await prisma.usersToWorkspaces.findMany({
    where: { workspaceId: userData1.workspace.id },
  });
  expect(workspaceUsersBefore?.length).toBe(2);
  const workspaceUserIdsBefore = workspaceUsersBefore.map(
    (userToWorkspace) => userToWorkspace.userId
  );
  expect(
    workspaceUserIdsBefore.indexOf(userData1.user.id)
  ).toBeGreaterThanOrEqual(0);
  expect(
    workspaceUserIdsBefore.indexOf(userData2.user.id)
  ).toBeGreaterThanOrEqual(0);
  const deviceWorkspaceKeyBoxes: WorkspaceDeviceParing[] = [
    {
      ciphertext: user1MainDeviceGen1.ciphertext,
      nonce: user1MainDeviceGen1.nonce,
      receiverDeviceSigningPublicKey: userData1.mainDevice.signingPublicKey,
    },
    {
      ciphertext: user1WebDeviceGen1.ciphertext,
      nonce: user1WebDeviceGen1.nonce,
      receiverDeviceSigningPublicKey: userData1.webDevice.signingPublicKey,
    },
  ];

  const { lastChainEntry } = await getLastWorkspaceChainEvent({
    workspaceId: userData1.workspace.id,
  });
  const removeMemberEvent = workspaceChain.removeMember(
    workspaceChain.hashTransaction(lastChainEntry.transaction),
    {
      keyType: "ed25519",
      privateKey: sodium.from_base64(userData1.mainDevice.signingPrivateKey),
      publicKey: sodium.from_base64(userData1.mainDevice.signingPublicKey),
    },
    userData2.mainDevice.signingPublicKey
  );

  const workspaceKeyResult = await removeMemberAndRotateWorkspaceKey({
    graphql,
    workspaceId: userData1.workspace.id,
    workspaceKeyId: newWorkspaceKey.id,
    creatorDeviceSigningPublicKey: userData1.mainDevice.signingPublicKey,
    deviceWorkspaceKeyBoxes,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
    workspaceChainEvent: removeMemberEvent,
    mainDevice: userData1.mainDevice,
    userIdToRemove: userData2.user.id,
  });

  const resultingWorkspaceKey =
    workspaceKeyResult.removeMemberAndRotateWorkspaceKey.workspaceKey;
  expect(resultingWorkspaceKey.generation).toBe(1);
  // workspaceKeyBoxes will only return the device the user used for login
  expect(resultingWorkspaceKey.workspaceKeyBoxes.length).toBe(2);
  for (const workspaceKeyBox of resultingWorkspaceKey.workspaceKeyBoxes) {
    if (
      workspaceKeyBox.deviceSigningPublicKey ===
      userData1.mainDevice.signingPublicKey
    ) {
      expect(workspaceKeyBox.ciphertext).toBe(user1MainDeviceGen1.ciphertext);
      expect(workspaceKeyBox.nonce).toBe(user1MainDeviceGen1.nonce);
      expect(workspaceKeyBox.creatorDeviceSigningPublicKey).toBe(
        userData1.mainDevice.signingPublicKey
      );
    } else if (
      workspaceKeyBox.deviceSigningPublicKey ===
      userData1.webDevice.signingPublicKey
    ) {
      expect(workspaceKeyBox.ciphertext).toBe(user1WebDeviceGen1.ciphertext);
      expect(workspaceKeyBox.nonce).toBe(user1WebDeviceGen1.nonce);
      expect(workspaceKeyBox.creatorDeviceSigningPublicKey).toBe(
        userData1.mainDevice.signingPublicKey
      );
    } else {
      throw new Error("unexpected workspaceKeyBox");
    }
    expect(workspaceKeyBox.creatorDeviceSigningPublicKey).toBe(
      userData1.mainDevice.signingPublicKey
    );
  }
  const workspaceUsersAfter = await prisma.usersToWorkspaces.findMany({
    where: { workspaceId: userData1.workspace.id },
  });
  expect(workspaceUsersAfter?.length).toBe(1);
  const workspaceUserIdsAfter = workspaceUsersAfter.map(
    (userToWorkspace) => userToWorkspace.userId
  );
  expect(
    workspaceUserIdsAfter.indexOf(userData1.user.id)
  ).toBeGreaterThanOrEqual(0);
  expect(workspaceUserIdsAfter.indexOf(userData2.user.id)).toBe(-1);

  const workspaceResult = await getWorkspace({
    graphql,
    workspaceId: userData1.workspace.id,
    deviceSigningPublicKey: userData1.webDevice.signingPublicKey,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
  });

  const workspace = workspaceResult.workspace;
  expect(workspace.currentWorkspaceKey.id).toBe(resultingWorkspaceKey.id);
  expect(workspace.workspaceKeys.length).toBe(2);
  for (let i = 0; i < workspace.workspaceKeys.length; i++) {
    const workspaceKey = workspace.workspaceKeys[i];
    if (i === 0) {
      expect(workspaceKey.generation).toBe(1);
      expect(workspaceKey.id).toBe(workspace.currentWorkspaceKey.id);
    } else {
      expect(workspaceKey.generation).toBe(0);
      expect(workspaceKey.id).toBe(userData1.workspace.currentWorkspaceKey.id);
    }
    expect(workspaceKey.workspaceKeyBox).not.toBe(null);
    const workspaceKeyBox = workspaceKey.workspaceKeyBox;
    expect(workspaceKeyBox.deviceSigningPublicKey).toBe(
      userData1.webDevice.signingPublicKey
    );
  }

  const oldWorkspaceKeyBox = workspace.workspaceKeys[1].workspaceKeyBox;
  // get the root folders
  const rootFoldersResult = await getRootFolders({
    graphql,
    workspaceId: workspace.id,
    first: 50,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
  });
  const firstFolder = rootFoldersResult.rootFolders.edges[0].node;
  // fetch the workspaceKey for the folder
  const folderKeyTrace = deriveKeysFromKeyDerivationTrace({
    keyDerivationTrace: firstFolder.keyDerivationTrace,
    activeDevice: userData1.webDevice,
    workspaceKeyBox: oldWorkspaceKeyBox,
    workspaceId: userData1.workspace.id,
    workspaceKeyId: workspace.workspaceKeys[1].id,
  });
  let parentKey = workspaceKey;
  if (folderKeyTrace.trace.length > 1) {
    parentKey = folderKeyTrace.trace[folderKeyTrace.trace.length - 2].key;
  }
  const folderSubkeyId =
    folderKeyTrace.trace[folderKeyTrace.trace.length - 1].subkeyId;

  const workspaceMemberDevicesProof = await getWorkspaceMemberDevicesProof({
    userId: userData1.user.id,
    workspaceId: workspace.id,
    hash: firstFolder.workspaceMemberDevicesProofHash,
  });

  const decryptedFolderName = decryptFolderName({
    parentKey: parentKey,
    subkeyId: folderSubkeyId,
    ciphertext: firstFolder.nameCiphertext,
    nonce: firstFolder.nameNonce,
    signature: firstFolder.signature,
    folderId: firstFolder.id,
    workspaceId: workspace.id,
    keyDerivationTrace: firstFolder.keyDerivationTrace,
    workspaceMemberDevicesProof: workspaceMemberDevicesProof.proof,
    creatorDeviceSigningPublicKey: firstFolder.creatorDeviceSigningPublicKey,
  });
  expect(decryptedFolderName).toBe("Getting Started");
});

test("user can rotate key for multiple devices", async () => {
  const workspaceKey = getWorkspaceKeyForWorkspaceAndDevice({
    device: userData1.device,
    deviceEncryptionPrivateKey: userData1.deviceEncryptionPrivateKey,
    workspace: userData1.workspace,
  });
  const workspaceInvitationResult = await createWorkspaceInvitation({
    graphql,
    role: Role.VIEWER,
    workspaceId: userData1.workspace.id,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
    mainDevice: userData1.mainDevice,
  });
  const invitationId =
    workspaceInvitationResult.createWorkspaceInvitation.workspaceInvitation.id;
  await acceptWorkspaceInvitation({
    graphql,
    invitationId: invitationId,
    inviteeMainDevice: userData2.mainDevice,
    invitationSigningKeyPairSeed:
      workspaceInvitationResult.invitationSigningKeyPairSeed,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData2.sessionKey,
    }).authorization,
  });
  const user2DeviceKeyBox = encryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey: userData1.device.signingPublicKey,
    creatorDeviceEncryptionPrivateKey: userData1.deviceEncryptionPrivateKey,
    workspaceKey,
    workspaceId: userData1.workspace.id,
    workspaceKeyId: userData1.workspace.currentWorkspaceKey.id,
  });
  const user2DeviceKeyBoxes = [
    {
      workspaceId: userData1.workspace.id,
      workspaceKeyDevicePairs: [
        {
          workspaceKeyId: userData1.workspace.currentWorkspaceKey.id,
          nonce: user2DeviceKeyBox.nonce,
          ciphertext: user2DeviceKeyBox.nonce,
        },
      ],
    },
  ];
  await attachDeviceToWorkspaces({
    graphql,
    deviceSigningPublicKey: userData2.device.signingPublicKey,
    creatorDeviceSigningPublicKey: userData1.device.signingPublicKey,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
    deviceWorkspaceKeyBoxes: user2DeviceKeyBoxes,
  });
  const workspaceUsersBefore = await prisma.usersToWorkspaces.findMany({
    where: { workspaceId: userData1.workspace.id },
  });
  expect(workspaceUsersBefore?.length).toBe(2);
  const workspaceUserIdsBefore = workspaceUsersBefore.map(
    (userToWorkspace) => userToWorkspace.userId
  );
  expect(
    workspaceUserIdsBefore.indexOf(userData1.user.id)
  ).toBeGreaterThanOrEqual(0);
  expect(
    workspaceUserIdsBefore.indexOf(userData2.user.id)
  ).toBeGreaterThanOrEqual(0);

  const newWorkspaceKey = {
    id: generateId(),
    workspaceKey: sodium.to_base64(sodium.crypto_kdf_keygen()),
  };

  const keyData1 = encryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey: userData1.device.signingPublicKey,
    creatorDeviceEncryptionPrivateKey: userData1.deviceEncryptionPrivateKey,
    workspaceId: userData1.workspace.id,
    workspaceKey: newWorkspaceKey.workspaceKey,
    workspaceKeyId: newWorkspaceKey.id,
  });
  const keyData2 = encryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey: userData1.webDevice.signingPublicKey,
    creatorDeviceEncryptionPrivateKey: userData1.deviceEncryptionPrivateKey,
    workspaceId: userData1.workspace.id,
    workspaceKey: newWorkspaceKey.workspaceKey,
    workspaceKeyId: newWorkspaceKey.id,
  });
  const loginResult = await createDeviceAndLogin({
    username: userData1.user.username,
    envelope: userData1.envelope,
    password: password1,
    mainDevice: userData1.mainDevice,
  });
  const newDevice = loginResult.webDevice;
  const keyData3 = encryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey: newDevice.signingPublicKey,
    creatorDeviceEncryptionPrivateKey: userData1.deviceEncryptionPrivateKey,
    workspaceId: userData1.workspace.id,
    workspaceKey: newWorkspaceKey.workspaceKey,
    workspaceKeyId: newWorkspaceKey.id,
  });
  const deviceWorkspaceKeyBoxes: WorkspaceDeviceParing[] = [
    {
      ciphertext: keyData1.ciphertext,
      nonce: keyData1.nonce,
      receiverDeviceSigningPublicKey: userData1.device.signingPublicKey,
    },
    {
      ciphertext: keyData2.ciphertext,
      nonce: keyData2.nonce,
      receiverDeviceSigningPublicKey: userData1.webDevice.signingPublicKey,
    },
    {
      ciphertext: keyData3.ciphertext,
      nonce: keyData3.nonce,
      receiverDeviceSigningPublicKey: newDevice.signingPublicKey,
    },
  ];

  const { lastChainEntry } = await getLastWorkspaceChainEvent({
    workspaceId: userData1.workspace.id,
  });
  const removeMemberEvent = workspaceChain.removeMember(
    workspaceChain.hashTransaction(lastChainEntry.transaction),
    {
      keyType: "ed25519",
      privateKey: sodium.from_base64(userData1.mainDevice.signingPrivateKey),
      publicKey: sodium.from_base64(userData1.mainDevice.signingPublicKey),
    },
    userData2.mainDevice.signingPublicKey
  );

  const workspaceKeyResult = await removeMemberAndRotateWorkspaceKey({
    graphql,
    workspaceId: userData1.workspace.id,
    workspaceKeyId: newWorkspaceKey.id,
    creatorDeviceSigningPublicKey: userData1.device.signingPublicKey,
    deviceWorkspaceKeyBoxes,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
    workspaceChainEvent: removeMemberEvent,
    mainDevice: userData1.mainDevice,
    userIdToRemove: userData2.user.id,
  });
  const resultingWorkspaceKey =
    workspaceKeyResult.removeMemberAndRotateWorkspaceKey.workspaceKey;
  expect(resultingWorkspaceKey.generation).toBe(1);
  expect(resultingWorkspaceKey.workspaceKeyBoxes.length).toBe(3);
  for (let workspaceKeyBox of resultingWorkspaceKey.workspaceKeyBoxes) {
    expect(workspaceKeyBox.creatorDeviceSigningPublicKey).toBe(
      userData1.device.signingPublicKey
    );
    const receiverKey = workspaceKeyBox.deviceSigningPublicKey;
    if (receiverKey === userData1.device.signingPublicKey) {
      expect(workspaceKeyBox.ciphertext).toBe(keyData1.ciphertext);
      expect(workspaceKeyBox.nonce).toBe(keyData1.nonce);
    } else if (receiverKey === userData1.webDevice.signingPublicKey) {
      expect(workspaceKeyBox.ciphertext).toBe(keyData2.ciphertext);
      expect(workspaceKeyBox.nonce).toBe(keyData2.nonce);
    } else if (receiverKey === newDevice.signingPublicKey) {
      expect(workspaceKeyBox.ciphertext).toBe(keyData3.ciphertext);
      expect(workspaceKeyBox.nonce).toBe(keyData3.nonce);
    } else {
      expect(workspaceKeyBox).toBe(undefined);
    }
  }
  const workspaceUsersAfter = await prisma.usersToWorkspaces.findMany({
    where: { workspaceId: userData1.workspace.id },
  });
  expect(workspaceUsersAfter?.length).toBe(1);
  const workspaceUserIdsAfter = workspaceUsersAfter.map(
    (userToWorkspace) => userToWorkspace.userId
  );
  expect(
    workspaceUserIdsAfter.indexOf(userData1.user.id)
  ).toBeGreaterThanOrEqual(0);
  expect(workspaceUserIdsAfter.indexOf(userData2.user.id)).toBe(-1);

  const workspaceResult = await getWorkspace({
    graphql,
    workspaceId: userData1.workspace.id,
    deviceSigningPublicKey: userData1.device.signingPublicKey,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
  });

  const workspace = workspaceResult.workspace;
  expect(workspace.currentWorkspaceKey.id).toBe(resultingWorkspaceKey.id);
  expect(workspace.workspaceKeys.length).toBe(2);
  expect(workspace.workspaceKeys[0].generation).toBe(1);
  expect(workspace.workspaceKeys[0].id).toBe(workspace.currentWorkspaceKey.id);
  expect(workspace.workspaceKeys[0].workspaceKeyBox).toBeDefined();
  expect(
    workspace.workspaceKeys[0].workspaceKeyBox.deviceSigningPublicKey
  ).toBe(userData1.device.signingPublicKey);

  expect(workspace.workspaceKeys[1].generation).toBe(0);
  expect(workspace.workspaceKeys[1].id).toBe(
    userData1.workspace.currentWorkspaceKey.id
  );
  expect(workspace.workspaceKeys[1].workspaceKeyBox).toBeDefined();
  expect(
    workspace.workspaceKeys[1].workspaceKeyBox.deviceSigningPublicKey
  ).toBe(userData1.device.signingPublicKey);
});

describe("Input errors", () => {
  const authorizationHeaders = {
    authorization: "someSessionKey",
  };
  const query = gql`
    mutation ($input: RemoveMemberAndRotateWorkspaceKeyInput!) {
      removeMemberAndRotateWorkspaceKey(input: $input) {
        workspaceKey {
          id
          generation
          workspaceId
          workspaceKeyBoxes {
            id
            deviceSigningPublicKey
            creatorDeviceSigningPublicKey
            ciphertext
            nonce
          }
        }
      }
    }
  `;
  test("Invalid invitationId", async () => {
    await expect(
      (async () =>
        await graphql.client.request<any>(
          query,
          {
            input: {
              creatorDeviceSigningPublicKey: null,
            },
          },
          authorizationHeaders
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("Invalid input", async () => {
    await expect(
      (async () =>
        await graphql.client.request<any>(
          query,
          { input: null },
          authorizationHeaders
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("No input", async () => {
    await expect(
      (async () =>
        await graphql.client.request<any>(
          query,
          undefined,
          authorizationHeaders
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
});
