import { gql } from "graphql-request";
import { registerUser } from "../../../test/helpers/authentication/registerUser";
import deleteAllRecords from "../../../test/helpers/deleteAllRecords";
import setupGraphql from "../../../test/helpers/setupGraphql";

const graphql = setupGraphql();
const username = "7dfb4dd9-88be-414c-8a40-b5c030003d89@example.com";
const username2 = "08844f05-ef88-4ac0-acf8-1e5163c2dcdb@example.com";
const password = "password22room5K42";
let sessionKey = "";

const setup = async () => {
  const registerUserResult = await registerUser(graphql, username, password);
  sessionKey = registerUserResult.sessionKey;
  return { sessionKey };
};

beforeAll(async () => {
  await deleteAllRecords();
  const setupResult = await setup();
  sessionKey = setupResult.sessionKey;
});

test("can retrieve a user by username", async () => {
  const authorizationHeader = { authorization: sessionKey };
  // get root folders from graphql
  const query = gql`
    {
      userIdFromUsername(username: "${username}") {
        id
      }
    }
  `;
  const result = await graphql.client.request(query, null, authorizationHeader);
  expect(result.me).toMatchInlineSnapshot(`undefined`);
});

test("can't retrieve a non-existant user", async () => {
  const authorizationHeader = { authorization: sessionKey };
  const query = gql`
    {
      userIdFromUsername(username: "${username2}") {
        id
      }
    }
  `;
  await expect(
    (async () =>
      await graphql.client.request(query, null, authorizationHeader))()
  ).rejects.toThrow("User not found");
});

test("Unauthenticated", async () => {
  const authorizationHeader = { authorization: "badauthheader" };
  const query = gql`
    {
      userIdFromUsername(username: "${username2}") {
        id
      }
    }
  `;
  await expect(
    (async () =>
      await graphql.client.request(query, null, authorizationHeader))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

describe("Input errors", () => {
  test("Invalid input", async () => {
    const authorizationHeader = { authorization: sessionKey };
    const query1 = gql`
      {
        userIdFromUsername(username: "") {
          id
        }
      }
    `;
    await expect(
      (async () =>
        await graphql.client.request(query1, null, authorizationHeader))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("Invalid username", async () => {
    const authorizationHeader = { authorization: sessionKey };
    const query2 = gql`
      {
        userIdFromUsername(username: "nouser") {
          id
        }
      }
    `;
    await expect(
      (async () =>
        await graphql.client.request(query2, null, authorizationHeader))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
});
