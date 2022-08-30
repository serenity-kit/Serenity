import { gql } from "graphql-request";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { registerUser } from "../../../../test/helpers/authentication/registerUser";

const graphql = setupGraphql();
const username = "7dfb4dd9-88be-414c-8a40-b5c030003d89@example.com";
const username2 = "08844f05-ef88-4ac0-acf8-1e5163c2dcdb@example.com";
const pendingWorkspaceInvitation2 = "08844f05-ef88-4ac0-acf8-1e5163c2dcdb";
const password = "password";

beforeAll(async () => {
  await deleteAllRecords();
});

test("user should be be able to get their pending workspace invitation when null", async () => {
  const registerUser1Result = await registerUser(graphql, username, password);
  const sessionKey = registerUser1Result.sessionKey;
  const authorizationHeader = { authorization: sessionKey };
  // get root folders from graphql
  const query = gql`
    {
      pendingWorkspaceInvitation {
        id
      }
    }
  `;
  const result = await graphql.client.request(query, null, authorizationHeader);
  expect(result.pendingWorkspaceInvitation).toMatchInlineSnapshot(`
    {
      "id": null,
    }
  `);
});

test("user should be be able to get their pending workspace invitation", async () => {
  const registerUser1Result = await registerUser(
    graphql,
    username2,
    password,
    pendingWorkspaceInvitation2
  );
  const sessionKey = registerUser1Result.sessionKey;
  const authorizationHeader = { authorization: sessionKey };
  // get root folders from graphql
  const query = gql`
    {
      pendingWorkspaceInvitation {
        id
      }
    }
  `;
  const result = await graphql.client.request(query, null, authorizationHeader);
  expect(result.pendingWorkspaceInvitation).toMatchInlineSnapshot(`
      {
        "id": "${pendingWorkspaceInvitation2}",
      }
    `);
});

test("Unauthenticated", async () => {
  const authorizationHeader = { authorization: "badauthheader" };
  const query = gql`
    {
      pendingWorkspaceInvitation {
        id
      }
    }
  `;
  await expect(
    (async () =>
      await graphql.client.request(query, null, authorizationHeader))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});
