import { generateId } from "@serenity-tools/common";
import { gql } from "graphql-request";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { deleteWorkspaces } from "../../../../test/helpers/workspace/deleteWorkspaces";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
let userData1: any = undefined;
const password = "password";

const setup = async () => {
  userData1 = await createUserWithWorkspace({
    id: generateId(),
    username: `${generateId()}@example.com`,
    password,
  });
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("user should be able to delete a workspace", async () => {
  const result = await deleteWorkspaces({
    graphql,
    ids: [userData1.workspace.id],
    authorizationHeader: userData1.sessionKey,
  });
  expect(result.deleteWorkspace).toMatchInlineSnapshot(`undefined`);
});

test("Deleting nonexistent workspace does nothing", async () => {
  const ids = ["badthing"];
  const result = await deleteWorkspaces({
    graphql,
    ids,
    authorizationHeader: userData1.sessionKey,
  });
  expect(result.deleteWorkspace).toMatchInlineSnapshot(`undefined`);
});

test("Unauthenticated", async () => {
  const ids = [userData1.workspace.id];
  await expect(
    (async () =>
      await deleteWorkspaces({
        graphql,
        ids,
        authorizationHeader: "bad-session-key",
      }))()
  ).rejects.toThrowError("Not authenticated");
});

test("Input Errors", async () => {
  const authorizationHeaders = {
    authorization: userData1.sessionKey,
  };
  const query = gql`
    mutation {
      deleteWorkspaces(input: { ids: null }) {
        status
      }
    }
  `;
  await expect(
    (async () =>
      await graphql.client.request(query, null, authorizationHeaders))()
  ).rejects.toThrowError();
});
