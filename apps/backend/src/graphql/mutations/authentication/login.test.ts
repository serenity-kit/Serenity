import { gql } from "graphql-request";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import sodium from "libsodium-wrappers";
import { Login } from "../../../vendor/opaque-wasm/opaque_wasm";
import { registerUser } from "../../../../test/helpers/registerUser";

const graphql = setupGraphql();
const username = "user";
const password = "password";
let login: any = null;

beforeAll(async () => {
  await deleteAllRecords();
});

const requestLoginChallengeResponse = async (
  username: string,
  password: string
) => {
  login = new Login();
  const challenge = sodium.to_base64(login.start(password));
  const query = gql`
      mutation {
        startLogin(
          input: {
            username: "${username}"
            challenge: "${challenge}"
          }
        ) {
          loginId
          challengeResponse
        }
      }
    `;
  const data = await graphql.client.request(query);
  return {
    data: data.startLogin,
  };
};

test("server should register a user", async () => {
  // FIRST TEST ONLY: register a user.
  // we can't run this in beforeAll() because `graphql` isnt' set up
  // generate registration challenge
  await registerUser(
    graphql,
    username,
    password,
    "ad350911-2c74-4bfb-8a5a-3910a9864be2"
  );
});

test("server should create a login challenge response", async () => {
  // generate a challenge code
  const result = await requestLoginChallengeResponse(username, password);
  expect(typeof result.data.loginId).toBe("string");
  expect(typeof result.data.challengeResponse).toBe("string");
});

test("server should login a user", async () => {
  // create keys on server side and return response
  const result = await requestLoginChallengeResponse(username, password);

  const finishMessage = sodium.to_base64(
    login.finish(sodium.from_base64(result.data.challengeResponse))
  );
  const query = gql`
    mutation {
      finishLogin(
        input: {
          loginId: "${result.data.loginId}"
          message: "${finishMessage}"
        }
      ) {
        success
      }
    }
  `;
  // client gets login response from server, which contains encrypted data
  const loginResponse = await graphql.client.request(query);
  expect(loginResponse.finishLogin.success).toBe(true);
});
