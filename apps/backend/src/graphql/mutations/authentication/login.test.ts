import { client } from "@serenity-kit/opaque";
import {
  createDevice as createdDeviceHelper,
  generateId,
} from "@serenity-tools/common";
import { gql } from "graphql-request";
import sodium from "react-native-libsodium";
import { registerUser } from "../../../../test/helpers/authentication/registerUser";
import { requestLoginChallengeResponse } from "../../../../test/helpers/authentication/requestLoginChallengeResponse";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import setupGraphql from "../../../../test/helpers/setupGraphql";

const graphql = setupGraphql();
const username = `${generateId()}@example.com`;
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

  const clientLoginFinishResult = client.finishLogin({
    password,
    clientLoginState: result.clientLoginState,
    loginResponse: result.data.challengeResponse,
  });
  if (!clientLoginFinishResult) {
    throw new Error("clientLoginFinishResult is null");
  }
  const sessionKey = clientLoginFinishResult.sessionKey;

  const device = createdDeviceHelper("user");
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
  // client gets login response from server, which contains encrypted data
  const loginResponse = await graphql.client.request(query, {
    input: {
      loginId: result.data.loginId,
      message: clientLoginFinishResult.finishLoginRequest,
    },
  });
  expect(loginResponse.finishLogin.userChain).toBeDefined();
  expect(loginResponse.finishLogin.mainDevice).toBeDefined();
  expect(loginResponse.finishLogin.mainDevice.ciphertext).toBeDefined();
  expect(loginResponse.finishLogin.mainDevice.nonce).toBeDefined();
});

describe("Input errors", () => {
  const query = gql`
    mutation finishLogin($input: FinishLoginInput) {
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
  test("Invalid email", async () => {
    await expect(
      (async () =>
        await requestLoginChallengeResponse({
          graphql,
          username: "invalid-email",
          password,
        }))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("Invalid loginId", async () => {
    const result = await requestLoginChallengeResponse({
      graphql,
      username,
      password,
    });

    const clientLoginFinishResult = client.finishLogin({
      password,
      clientLoginState: result.clientLoginState,
      loginResponse: result.data.challengeResponse,
    });
    if (!clientLoginFinishResult) {
      throw new Error("clientLoginFinishResult is null");
    }
    await expect(
      (async () =>
        await graphql.client.request(query, {
          input: {
            loginId: null,
            message: clientLoginFinishResult.finishLoginRequest,
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
