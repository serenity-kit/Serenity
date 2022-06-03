import { gql } from "graphql-request";
import setupGraphql from "../../../test/helpers/setupGraphql";
import deleteAllRecords from "../../../test/helpers/deleteAllRecords";
import { registerUser } from "../../../test/helpers/registerUser";

const graphql = setupGraphql();
const username = "7dfb4dd9-88be-414c-8a40-b5c030003d89@example.com";
const username2 = "08844f05-ef88-4ac0-acf8-1e5163c2dcdb@example.com";
const password = "password";
let didRegisterUser = false;

beforeAll(async () => {
  await deleteAllRecords();
});

beforeEach(async () => {
  // TODO: we don't want this before every test
  if (!didRegisterUser) {
    await registerUser(graphql, username, password);
    didRegisterUser = true;
  }
});

test("can retrieve a user by username", async () => {
  const authorizationHeader = { authorization: `TODO+${username}` };
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
  const authorizationHeader = { authorization: `TODO+${username}` };
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
