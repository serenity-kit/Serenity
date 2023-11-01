import { client, ready as opaqueReady } from "@serenity-kit/opaque";
import * as userChain from "@serenity-kit/user-chain";
import { LocalDevice, createDevice, generateId } from "@serenity-tools/common";
import { gql } from "graphql-request";
import sodium from "react-native-libsodium";
import { addHours } from "../../../src/utils/addHours/addHours";
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
    },
  });

  return {
    sessionKey,
    device,
  };
};
