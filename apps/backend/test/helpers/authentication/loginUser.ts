import { client, ready as opaqueReady } from "@serenity-kit/opaque";
import * as userChain from "@serenity-kit/user-chain";
import * as workspaceMemberDevicesProofUtil from "@serenity-kit/workspace-member-devices-proof";
import { LocalDevice, createDevice, generateId } from "@serenity-tools/common";
import { gql } from "graphql-request";
import sodium from "react-native-libsodium";
import { prisma } from "../../../src/database/prisma";
import { getLastUserChainEventWithState } from "../../../src/database/userChain/getLastUserChainEventWithState";
import { getWorkspaceMemberDevicesProofs } from "../../../src/database/workspace/getWorkspaceMemberDevicesProofs";
import { addHours } from "../../../src/utils/addHours/addHours";
import { getLastWorkspaceChainEvent } from "../workspace/getLastWorkspaceChainEvent";
import { requestLoginChallengeResponse } from "./requestLoginChallengeResponse";

type Params = {
  graphql: any;
  username: string;
  password: string;
  mainDevice: LocalDevice;
};

export const loginUser = async ({
  graphql,
  username,
  password,
  mainDevice,
}: Params) => {
  await opaqueReady;
  const startLoginResult = await requestLoginChallengeResponse({
    graphql,
    username,
    password,
  });

  const clientLoginFinishResult = client.finishLogin({
    password,
    clientLoginState: startLoginResult.clientLoginState,
    loginResponse: startLoginResult.data.challengeResponse,
  });
  if (!clientLoginFinishResult) {
    throw new Error("clientLoginFinishResult is null");
  }

  const finishLoginQuery = gql`
    mutation finishLogin($input: FinishLoginInput!) {
      finishLogin(input: $input) {
        userChain {
          position
          serializedContent
        }
        mainDevice {
          ciphertext
          nonce
        }
      }
    }
  `;

  const sessionKey = clientLoginFinishResult.sessionKey;

  const finishLoginResult = await graphql.client.request(finishLoginQuery, {
    input: {
      loginId: startLoginResult.data.loginId,
      message: clientLoginFinishResult.finishLoginRequest,
    },
  });

  const device = createDevice("user");
  const deviceInfoJson = {
    type: "web",
    OS: "MacOS",
    OsVersion: null,
    Browser: "chrome",
    BrowserVersion: "100.0.1",
  };
  const deviceInfo = JSON.stringify(deviceInfoJson);

  const sessionTokenSignature = sodium.crypto_sign_detached(
    "login_session_key" + sessionKey,
    sodium.from_base64(device.signingPrivateKey)
  );

  const expiresAt = addHours(new Date(), 1);
  const lastUserChainEvent = JSON.parse(
    finishLoginResult.finishLogin.userChain[
      finishLoginResult.finishLogin.userChain.length - 1
    ].serializedContent
  );
  const firstUserChainEvent = JSON.parse(
    finishLoginResult.finishLogin.userChain[0].serializedContent
  );
  const userId = firstUserChainEvent.transaction.id;

  const addDeviceEvent = userChain.addDevice({
    authorKeyPair: {
      privateKey: mainDevice.signingPrivateKey,
      publicKey: mainDevice.signingPublicKey,
    },
    signingPrivateKey: device.signingPrivateKey,
    signingPublicKey: device.signingPublicKey,
    encryptionPublicKey: device.encryptionPublicKey,
    prevEvent: lastUserChainEvent,
    expiresAt,
  });

  const { userChainState } = await getLastUserChainEventWithState({
    prisma,
    userId,
  });

  const newUserChainState = userChain.applyEvent({
    state: userChainState,
    event: addDeviceEvent,
    knownVersion: userChain.version,
  });

  const existingWorkspaceMemberDevicesProofs =
    await getWorkspaceMemberDevicesProofs({
      userId,
      take: 100,
    });

  const workspaceMemberDevicesProofs = await Promise.all(
    existingWorkspaceMemberDevicesProofs.map(async (existingEntry) => {
      const { workspaceChainState } = await getLastWorkspaceChainEvent({
        workspaceId: existingEntry.workspaceId,
      });
      const workspaceMemberDevicesProofData: workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProofData =
        {
          clock: existingEntry.proof.clock + 1,
          userChainHashes: {
            ...existingEntry.data.userChainHashes,
            [userId]: newUserChainState.eventHash,
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
        serializedWorkspaceMemberDevicesProof: JSON.stringify(newProof),
      };
    })
  );

  const addDeviceQuery = gql`
    mutation addDevice($input: AddDeviceInput!) {
      addDevice(input: $input) {
        expiresAt
      }
    }
  `;

  graphql.client.setHeader("authorization", sessionKey);
  await graphql.client.request(addDeviceQuery, {
    input: {
      loginId: startLoginResult.data.loginId,
      deviceSigningPublicKey: device.signingPublicKey,
      deviceEncryptionPublicKey: device.encryptionPublicKey,
      deviceEncryptionPublicKeySignature: device.encryptionPublicKeySignature,
      deviceInfo,
      sessionTokenSignature: sodium.to_base64(sessionTokenSignature),
      deviceType: "web",
      serializedUserChainEvent: JSON.stringify(addDeviceEvent),
      webDeviceCiphertext: "webDeviceCiphertextMock-local",
      webDeviceNonce: `webDeviceNonceMock-local${generateId()}`, // since it must be unique
      workspaceMemberDevicesProofs,
    },
  });

  return {
    sessionKey,
    device,
  };
};
