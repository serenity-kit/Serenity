import { client, ready as opaqueReady } from "@serenity-kit/opaque";
import { generateId } from "@serenity-tools/common";
import { gql } from "graphql-request";
import { registerUser } from "../../../../test/helpers/authentication/registerUser";
import { requestLoginChallengeResponse } from "../../../../test/helpers/authentication/requestLoginChallengeResponse";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import setupGraphql from "../../../../test/helpers/setupGraphql";

const graphql = setupGraphql();
const username = `${generateId()}@example.com`;
const password = "password22room5K42";

beforeAll(async () => {
  await opaqueReady;
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
  const loginResponse = await graphql.client.request<any>(query, {
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

test("server should return a dummy opaque startLogin response", async () => {
  // create keys on server side and return response
  const result = await requestLoginChallengeResponse({
    graphql,
    username: `FAKE${username}`,
    password,
  });

  expect(result.data.loginId).toBeDefined();
  expect(result.data.challengeResponse).toBeDefined();

  const clientLoginFinishResult = client.finishLogin({
    password,
    clientLoginState: result.clientLoginState,
    loginResponse: result.data.challengeResponse,
  });
  expect(clientLoginFinishResult).toBeUndefined();
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
        await graphql.client.request<any>(query, {
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
        await graphql.client.request<any>(query, {
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
        await graphql.client.request<any>(query, {
          input: null,
        }))()
    ).rejects.toThrowError(/GRAPHQL_VALIDATION_FAILED/);
  });

  test("No input", async () => {
    await expect(
      (async () => await graphql.client.request<any>(query))()
    ).rejects.toThrowError(/GRAPHQL_VALIDATION_FAILED/);
  });
});
