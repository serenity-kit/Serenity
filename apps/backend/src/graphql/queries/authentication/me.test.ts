import { gql } from "graphql-request";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { registerUser } from "../../../../test/helpers/authentication/registerUser";

const graphql = setupGraphql();
let userId = "";
const username = "7dfb4dd9-88be-414c-8a40-b5c030003d89@example.com";
const username2 = "08844f05-ef88-4ac0-acf8-1e5163c2dcdb@example.com";
const password = "password";
let sessionKey = "";

const setup = async () => {
  const registerUserResult = await registerUser(graphql, username, password);
  userId = registerUserResult.userId;
  sessionKey = registerUserResult.sessionKey;
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("user should be be able to get their username", async () => {
  const authorizationHeader = { authorization: sessionKey };
  // get root folders from graphql
  const query = gql`
    {
      me {
        id
        username
      }
    }
  `;
  const result = await graphql.client.request(query, null, authorizationHeader);
  expect(result.me).toMatchInlineSnapshot(`
    {
      "id": "${userId}",
      "username": "${username}",
    }
  `);
});

test("Unauthenticated", async () => {
  const authorizationHeader = {
    authorization: "lala",
  };
  const query = gql`
    {
      me {
        id
        username
      }
    }
  `;
  await expect(
    (async () =>
      await graphql.client.request(query, null, authorizationHeader))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});
