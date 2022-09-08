import { gql } from "graphql-request";
import { v4 as uuidv4 } from "uuid";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { createWorkspaceInvitation } from "../../../../test/helpers/workspace/createWorkspaceInvitation";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";
import { acceptWorkspaceInvitation } from "../../../database/workspace/acceptWorkspaceInvitation";

const graphql = setupGraphql();
const username = "7dfb4dd9-88be-414c-8a40-b5c030003d89@example.com";
const password = "password";

let userId = "";
let sessionKey = "";
let workspace1Id = "";

const setup = async () => {
  const userAndDevice = await createUserWithWorkspace({
    id: uuidv4(),
    username,
    password,
  });
  userId = userAndDevice.user.id;
  sessionKey = userAndDevice.sessionKey;
  workspace1Id = userAndDevice.workspace.id;
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("no unauthorized members when workspace created", async () => {
  const authorizationHeader = { authorization: sessionKey };
  const query = gql`
    query unauthorizedMembers($workspaceIds: [ID]!) {
      unauthorizedMembers(workspaceIds: $workspaceIds) {
        userIds
      }
    }
  `;
  const result = await graphql.client.request(
    query,
    {
      workspaceIds: [workspace1Id],
    },
    authorizationHeader
  );
  expect(result.unauthorizedMembers.userIds.length).toBe(0);
});

test("unauthorized members when workspace added", async () => {
  const otherUserAndDevice = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
    password,
  });
  const otherUserId = otherUserAndDevice.user.id;
  const workspaceInvitationResult = await createWorkspaceInvitation({
    graphql,
    workspaceId: workspace1Id,
    authorizationHeader: sessionKey,
  });
  const workspaceInvitationId =
    workspaceInvitationResult.createWorkspaceInvitation.workspaceInvitation.id;
  await acceptWorkspaceInvitation({
    workspaceInvitationId,
    userId: otherUserId,
  });
  const authorizationHeader = { authorization: sessionKey };
  const query = gql`
    query unauthorizedMembers($workspaceIds: [ID]!) {
      unauthorizedMembers(workspaceIds: $workspaceIds) {
        userIds
      }
    }
  `;
  const result = await graphql.client.request(
    query,
    {
      workspaceIds: [workspace1Id],
    },
    authorizationHeader
  );
  expect(result.unauthorizedMembers.userIds.length).toBe(1);
  expect(result.unauthorizedMembers.userIds[0]).toBe(otherUserId);
  // TODO: test when user1 accepts workspaceInvitation
});

test("Unauthenticated", async () => {
  const authorizationHeader = { authorization: "badauthheader" };
  const query = gql`
    query unauthorizedMembers($workspaceIds: [ID]!) {
      unauthorizedMembers(workspaceIds: $workspaceIds) {
        userIds
      }
    }
  `;
  await expect(
    (async () =>
      await graphql.client.request(
        query,
        { workspaceIds: [workspace1Id] },
        authorizationHeader
      ))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});
