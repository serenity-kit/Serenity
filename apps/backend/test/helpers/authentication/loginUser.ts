import { clientLoginFinish } from "@serenity-kit/opaque";
import { createDevice } from "@serenity-tools/common";
import { gql } from "graphql-request";
import sodium from "react-native-libsodium";
import { requestLoginChallengeResponse } from "./requestLoginChallengeResponse";

type Params = {
  graphql: any;
  username: string;
  password: string;
};

export const loginUser = async ({ graphql, username, password }: Params) => {
  const startLoginResult = await requestLoginChallengeResponse({
    graphql,
    username,
    password,
  });

  const clientLoginFinishResult = clientLoginFinish({
    password,
    clientLogin: startLoginResult.login,
    credentialResponse: startLoginResult.data.challengeResponse,
  });
  if (!clientLoginFinishResult) {
    throw new Error("clientLoginFinishResult is null");
  }

  const finishLoginQuery = gql`
    mutation finishLogin($input: FinishLoginInput!) {
      finishLogin(input: $input) {
        expiresAt
      }
    }
  `;

  const sessionKey = clientLoginFinishResult.sessionKey;

  const device = createDevice();
  const deviceInfoJson = {
    type: "web",
    OS: "MacOS",
    OsVersion: null,
    Browser: "chrome",
    BrowserVersion: "100.0.1",
  };
  const deviceInfo = JSON.stringify(deviceInfoJson);

  const sessionTokenSignature = sodium.crypto_sign_detached(
    sessionKey,
    sodium.from_base64(device.signingPrivateKey)
  );

  await graphql.client.request(finishLoginQuery, {
    input: {
      loginId: startLoginResult.data.loginId,
      message: clientLoginFinishResult.credentialFinalization,
      deviceSigningPublicKey: device.signingPublicKey,
      deviceEncryptionPublicKey: device.encryptionPublicKey,
      deviceEncryptionPublicKeySignature: device.encryptionPublicKeySignature,
      deviceInfo: deviceInfo,
      sessionTokenSignature: sodium.to_base64(sessionTokenSignature),
      deviceType: "web",
    },
  });

  return {
    sessionKey,
    device,
  };
};
