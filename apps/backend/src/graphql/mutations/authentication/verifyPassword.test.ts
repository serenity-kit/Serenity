import { gql } from "graphql-request";
import sodium from "react-native-libsodium";
import { v4 as uuidv4 } from "uuid";
import { requestLoginChallengeResponse } from "../../../../test/helpers/authentication/requestLoginChallengeResponse";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
const username = `${uuidv4()}@example.com`;
const password = "password";
let userData: any = undefined;

beforeAll(async () => {
  await deleteAllRecords();
  // await registerUser(graphql, username, password);
  userData = await createUserWithWorkspace({
    id: uuidv4(),
    username,
    password,
  });
});

export type VerifyPasswordProps = {
  loginId: string;
  message: string;
  deviceSigningPublicKey: string;
  sessionTokenSignature: string;
  authorizationHeader: string;
};
const verifyPassword = async ({
  loginId,
  message,
  deviceSigningPublicKey,
  sessionTokenSignature,
  authorizationHeader,
}: VerifyPasswordProps) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const query = gql`
    mutation verifyPassword($input: VerifyPasswordInput!) {
      verifyPassword(input: $input) {
        isValid
      }
    }
  `;
  // client gets login response from server, which contains encrypted data
  const verifyPasswordResponse = await graphql.client.request(
    query,
    {
      input: {
        loginId,
        message,
        deviceSigningPublicKey,
        sessionTokenSignature,
      },
    },
    authorizationHeaders
  );
  return verifyPasswordResponse;
};

test("verify user", async () => {
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
  const sessionTokenSignature = sodium.to_base64(
    sodium.crypto_sign_detached(
      userData.sessionKey,
      sodium.from_base64(userData.webDevice.signingPrivateKey)
    )
  );
  const verifyPasswordResponse = await verifyPassword({
    loginId: result.data.loginId,
    message: finishMessage,
    deviceSigningPublicKey: userData.webDevice.signingPublicKey,
    sessionTokenSignature,
    authorizationHeader: userData.sessionKey,
  });
  expect(verifyPasswordResponse.verifyPassword.isValid).toBe(true);
});

test("bad password", async () => {
  // create keys on server side and return response
  const result = await requestLoginChallengeResponse({
    graphql,
    username,
    password: "badpassword",
  });
  expect(() => {
    sodium.to_base64(
      result.login.finish(
        password,
        sodium.from_base64(result.data.challengeResponse)
      )
    );
  }).toThrow();
});

test("invalid email address", async () => {
  await expect(
    (async () =>
      await requestLoginChallengeResponse({
        graphql,
        username: "invalid-email",
        password,
      }))()
  ).rejects.toThrowError();
});

test("bad username", async () => {
  await expect(
    (async () =>
      await requestLoginChallengeResponse({
        graphql,
        username: "baduser@examplec.om",
        password,
      }))()
  ).rejects.toThrowError();
});

test("bad login", async () => {
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
  const sessionTokenSignature = sodium.to_base64(
    sodium.crypto_sign_detached(
      userData.sessionKey,
      sodium.from_base64(userData.webDevice.signingPrivateKey)
    )
  );
  await expect(
    (async () =>
      await verifyPassword({
        loginId: result.data.loginId,
        message: finishMessage,
        deviceSigningPublicKey: userData.webDevice.signingPublicKey,
        sessionTokenSignature,
        authorizationHeader: "invalid",
      }))()
  ).rejects.toThrowError();
});

describe("Input errors", () => {
  const query = gql`
    mutation verifyPassword($input: VerifyPasswordInput!) {
      verifyPassword(input: $input) {
        isValid
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
    const sessionTokenSignature = sodium.to_base64(
      sodium.crypto_sign_detached(
        userData.sessionKey,
        sodium.from_base64(userData.webDevice.signingPrivateKey)
      )
    );
    await expect(
      (async () =>
        await graphql.client.request(query, {
          input: {
            loginId: null,
            message: finishMessage,
            deviceSigningPublicKey: userData.webDevice.signingPublicKey,
            sessionTokenSignature,
            authorizationHeader: userData.sessionKey,
          },
        }))()
    ).rejects.toThrowError();
  });

  test("Invalid message", async () => {
    const result = await requestLoginChallengeResponse({
      graphql,
      username,
      password,
    });
    const sessionTokenSignature = sodium.to_base64(
      sodium.crypto_sign_detached(
        userData.sessionKey,
        sodium.from_base64(userData.webDevice.signingPrivateKey)
      )
    );
    await expect(
      (async () =>
        await graphql.client.request(query, {
          input: {
            loginId: result.data.loginId,
            message: null,
            deviceSigningPublicKey: userData.webDevice.signingPublicKey,
            sessionTokenSignature,
            authorizationHeader: userData.sessionKey,
          },
        }))()
    ).rejects.toThrowError();
  });

  test("Invalid deviceSigningPublicKey", async () => {
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
    const sessionTokenSignature = sodium.to_base64(
      sodium.crypto_sign_detached(
        userData.sessionKey,
        sodium.from_base64(userData.webDevice.signingPrivateKey)
      )
    );
    await expect(
      (async () =>
        await graphql.client.request(query, {
          input: {
            loginId: null,
            message: finishMessage,
            deviceSigningPublicKey: null,
            sessionTokenSignature,
            authorizationHeader: userData.sessionKey,
          },
        }))()
    ).rejects.toThrowError();
  });

  test("Invalid sessionTokenSignature", async () => {
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
            deviceSigningPublicKey: userData.webDevice.signingPublicKey,
            sessionTokenSignature: null,
            authorizationHeader: userData.sessionKey,
          },
        }))()
    ).rejects.toThrowError();
  });

  test("Invalid input", async () => {
    await expect(
      (async () =>
        await graphql.client.request(query, {
          input: null,
        }))()
    ).rejects.toThrowError();
  });

  test("No input", async () => {
    await expect(
      (async () => await graphql.client.request(query, null))()
    ).rejects.toThrowError();
  });
});
