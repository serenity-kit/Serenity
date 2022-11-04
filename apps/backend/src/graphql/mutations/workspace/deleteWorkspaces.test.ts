import { gql } from "graphql-request";
import { v4 as uuidv4 } from "uuid";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { deleteWorkspaces } from "../../../../test/helpers/workspace/deleteWorkspaces";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
const password = "password";
let user1Data: any = null;

const setup = async () => {
  user1Data = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
    password,
  });
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test.only("user should be able to delete a workspace", async () => {
  const result = await deleteWorkspaces({
    graphql,
    ids: [user1Data.workspace.id],
    authorizationHeader: user1Data.sessionKey,
  });
  expect(result.deleteWorkspace).toMatchInlineSnapshot(`undefined`);
});

test("Deleting nonexistent workspace does nothing", async () => {
  await expect(
    (async () =>
      await deleteWorkspaces({
        graphql,
        ids: ["bad-workspace-id"],
        authorizationHeader: user1Data.sessionKey,
      }))()
  ).rejects.toThrow(/BAD_USER_INPUT/);
});

test("Unauthenticated", async () => {
  await expect(
    (async () =>
      await deleteWorkspaces({
        graphql,
        ids: [user1Data.workspace.id],
        authorizationHeader: "bad-session-key",
      }))()
  ).rejects.toThrow(/UNAUTHENTICATED/);
});

test("Input Errors", async () => {
  const authorizationHeaders = {
    authorization: user1Data.sessionKey,
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
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});
