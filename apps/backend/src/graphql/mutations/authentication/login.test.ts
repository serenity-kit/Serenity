import { createDevice as createdDeviceHelper } from "@serenity-tools/common";
import { gql } from "graphql-request";
import sodium from "react-native-libsodium";
import { registerUser } from "../../../../test/helpers/authentication/registerUser";
import { requestLoginChallengeResponse } from "../../../../test/helpers/authentication/requestLoginChallengeResponse";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import setupGraphql from "../../../../test/helpers/setupGraphql";

const graphql = setupGraphql();
const username = "user";
const password = "password";

beforeAll(async () => {
  await deleteAllRecords();
});

test("server should register a user", async () => {
  await registerUser(graphql, username, password);
});

test("server should create a login challenge response", async () => {
  // generate a challenge code
  const result = await requestLoginChallengeResponse({
    graphql,
    username,
    password,
  });
  expect(typeof result.data.loginId).toBe("string");
  expect(typeof result.data.challengeResponse).toBe("string");
});

test("server should login a user", async () => {
  // create keys on server side and return response
  const result = await requestLoginChallengeResponse({
    graphql,
    username,
    password,
  });

  const finishMessage = sodium.to_base64(
    result.login.finish(
      password,
      sodium.from_base64(result.data.challengeResponse)
    )
  );

  const sessionKey = sodium.to_base64(result.login.getSessionKey());

  const device = await createdDeviceHelper();
  const deviceInfoJson = {
    type: "web",
    OS: "MacOS",
    OsVersion: null,
    Browser: "chrome",
    BrowserVersion: "100.0.1",
  };
  const deviceInfo = JSON.stringify(deviceInfoJson);

  const sessionTokenSignature = sodium.to_base64(
    sodium.crypto_sign_detached(
      sessionKey,
      sodium.from_base64(device.signingPrivateKey)
    )
  );

  const query = gql`
    mutation finishLogin($input: FinishLoginInput!) {
      finishLogin(input: $input) {
        expiresAt
      }
    }
  `;
  // client gets login response from server, which contains encrypted data
  const loginResponse = await graphql.client.request(query, {
    input: {
      loginId: result.data.loginId,
      message: finishMessage,
      deviceSigningPublicKey: device.signingPublicKey,
      deviceEncryptionPublicKey: device.encryptionPublicKey,
      deviceEncryptionPublicKeySignature: device.encryptionPublicKeySignature,
      deviceInfo: deviceInfo,
      sessionTokenSignature,
      deviceType: "web",
    },
  });
  expect(loginResponse.finishLogin.expiresAt).toBeDefined();
});

describe("Input errors", () => {
  const query = gql`
    mutation finishLogin($input: FinishLoginInput) {
      finishLogin(input: $input) {
        expiresAt
      }
    }
  `;
  test("Invalid loginId", async () => {
    const result = await requestLoginChallengeResponse({
      graphql,
      username,
      password,
    });

    const finishMessage = sodium.to_base64(
      result.login.finish(
        password,
        sodium.from_base64(result.data.challengeResponse)
      )
    );
    await expect(
      (async () =>
        await graphql.client.request(query, {
          input: {
            loginId: null,
            message: finishMessage,
          },
        }))()
    ).rejects.toThrowError(/GRAPHQL_VALIDATION_FAILED/);
  });

  test("Invalid message", async () => {
    const result = await requestLoginChallengeResponse({
      graphql,
      username,
      password,
    });
    await expect(
      (async () =>
        await graphql.client.request(query, {
          input: {
            loginId: result.data.loginId,
            message: null,
          },
        }))()
    ).rejects.toThrowError(/GRAPHQL_VALIDATION_FAILED/);
  });

  test("Invalid input", async () => {
    await expect(
      (async () =>
        await graphql.client.request(query, {
          input: null,
        }))()
    ).rejects.toThrowError(/GRAPHQL_VALIDATION_FAILED/);
  });

  test("No input", async () => {
    await expect(
      (async () => await graphql.client.request(query, null))()
    ).rejects.toThrowError(/GRAPHQL_VALIDATION_FAILED/);
  });
});
