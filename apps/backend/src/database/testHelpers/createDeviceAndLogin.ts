import { client, ready as opaqueReady, server } from "@serenity-kit/opaque";
import * as userChain from "@serenity-kit/user-chain";
import * as workspaceMemberDevicesProofUtil from "@serenity-kit/workspace-member-devices-proof";
import { LocalDevice, createDevice, generateId } from "@serenity-tools/common";
import sodium from "libsodium-wrappers";
import { getLastWorkspaceChainEvent } from "../../../test/helpers/workspace/getLastWorkspaceChainEvent";
import { addHours } from "../../utils/addHours/addHours";
import { createSessionAndDevice } from "../authentication/createSessionAndDevice";
import { prisma } from "../prisma";
import { getUserByUsername } from "../user/getUserByUsername";
import { getLastUserChainEventWithState } from "../userChain/getLastUserChainEventWithState";
import { getWorkspaceMemberDevicesProofs } from "../workspace/getWorkspaceMemberDevicesProofs";

type Params = {
  username: string;
  password: string;
  envelope: string;
  mainDevice: LocalDevice;
};

export const createDeviceAndLogin = async ({
  username,
  password,
  envelope,
  mainDevice,
}: Params) => {
  if (!process.env.OPAQUE_SERVER_SETUP) {
    throw new Error("OPAQUE_SERVER_SETUP is not set");
  }
  await opaqueReady;

  const clientLoginStartResult = client.startLogin({ password });
  const serverLoginStartResult = server.startLogin({
    registrationRecord: envelope,
    startLoginRequest: clientLoginStartResult.startLoginRequest,
    serverSetup: process.env.OPAQUE_SERVER_SETUP,
    userIdentifier: username,
  });
  const loginStartResponse = client.finishLogin({
    loginResponse: serverLoginStartResult.loginResponse,
    clientLoginState: clientLoginStartResult.clientLoginState,
    password,
  });

  if (!loginStartResponse) {
    throw new Error("Login failed");
  }

  const webDevice = createDevice("user");

  const user = await getUserByUsername({ username });
  const { lastUserChainEvent, userChainState } =
    await getLastUserChainEventWithState({
      prisma,
      userId: user.id,
    });

  const expiresAt = addHours(new Date(), 1);
  const addDeviceEvent = userChain.addDevice({
    authorKeyPair: {
      privateKey: mainDevice.signingPrivateKey,
      publicKey: mainDevice.signingPublicKey,
    },
    signingPrivateKey: webDevice.signingPrivateKey,
    signingPublicKey: webDevice.signingPublicKey,
    encryptionPublicKey: webDevice.encryptionPublicKey,
    prevEvent: lastUserChainEvent.content,
    expiresAt,
  });
  const newUserChainState = userChain.applyEvent({
    state: userChainState,
    event: addDeviceEvent,
    knownVersion: userChain.version,
  });

  const existingWorkspaceMemberDevicesProofs =
    await getWorkspaceMemberDevicesProofs({
      userId: user.id,
      take: 100,
    });

  const workspaceMemberDevicesProofEntries = await Promise.all(
    existingWorkspaceMemberDevicesProofs.map(async (existingEntry) => {
      const { workspaceChainState } = await getLastWorkspaceChainEvent({
        workspaceId: existingEntry.workspaceId,
      });

      const workspaceMemberDevicesProofData: workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProofData =
        {
          clock: existingEntry.proof.clock + 1,
          userChainHashes: {
            ...existingEntry.data.userChainHashes,
            [user.id]: newUserChainState.eventHash,
          },
          workspaceChainHash: workspaceChainState.lastEventHash,
        };
      const newProof =
        workspaceMemberDevicesProofUtil.createWorkspaceMemberDevicesProof({
          authorKeyPair: {
            privateKey: sodium.from_base64(mainDevice.signingPrivateKey),
            publicKey: sodium.from_base64(mainDevice.signingPublicKey),
            keyType: "ed25519",
          },
          workspaceMemberDevicesProofData,
        });
      return {
        workspaceId: existingEntry.workspaceId,
        workspaceMemberDevicesProof: newProof,
      };
    })
  );

  const session = await createSessionAndDevice({
    username,
    sessionKey: loginStartResponse.sessionKey,
    device: {
      ...webDevice,
      info: JSON.stringify({
        type: "web",
        OS: "MacOS",
        OsVersion: null,
        Browser: "chrome",
        BrowserVersion: "100.0.1",
      }),
    },
    addDeviceEvent,
    deviceType: "web",
    webDeviceCiphertext: "webDeviceCiphertextMock",
    webDeviceNonce: `webDeviceNonceMock${generateId()}`, // since it must be unique
    workspaceMemberDevicesProofEntries,
  });
  return {
    session,
    sessionKey: loginStartResponse.sessionKey,
    webDevice,
  };
};
