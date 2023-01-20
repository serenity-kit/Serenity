import { createDevice } from "@serenity-tools/common";
import sodium from "@serenity-tools/libsodium";
import { gql } from "graphql-request";
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
  const finishMessage = sodium.to_base64(
    startLoginResult.login.finish(
      sodium.from_base64(startLoginResult.data.challengeResponse)
    )
  );

  const finishLoginQuery = gql`
    mutation finishLogin($input: FinishLoginInput!) {
      finishLogin(input: $input) {
        expiresAt
      }
    }
  `;

  const sessionKey = sodium.to_base64(startLoginResult.login.getSessionKey());

  const device = createDevice();
  const deviceInfoJson = {
    type: "web",
    OS: "MacOS",
    OsVersion: null,
    Browser: "chrome",
    BrowserVersion: "100.0.1",
  };
  const deviceInfo = JSON.stringify(deviceInfoJson);

  const sessionTokenSignature = await sodium.crypto_sign_detached(
    sessionKey,
    device.signingPrivateKey
  );

  await graphql.client.request(finishLoginQuery, {
    input: {
      loginId: startLoginResult.data.loginId,
      message: finishMessage,
      deviceSigningPublicKey: device.signingPublicKey,
      deviceEncryptionPublicKey: device.encryptionPublicKey,
      deviceEncryptionPublicKeySignature: device.encryptionPublicKeySignature,
      deviceInfo: deviceInfo,
      sessionTokenSignature,
      deviceType: "web",
    },
  });

  return {
    sessionKey,
    device,
  };
};
