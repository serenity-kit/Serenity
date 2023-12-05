import { deriveSessionAuthorization, generateId } from "@serenity-tools/common";
import { Role } from "../../../../prisma/generated/output";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { acceptWorkspaceInvitation } from "../../../../test/helpers/workspace/acceptWorkspaceInvitation";
import { createWorkspaceInvitation } from "../../../../test/helpers/workspace/createWorkspaceInvitation";
import { getUnauthorizedMember } from "../../../../test/helpers/workspace/getUnauthorizedMember";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
const username = "7dfb4dd9-88be-414c-8a40-b5c030003d89@example.com";
const password = "password22room5K42";

let workspace1Id = "";
let userAndDevice: any = null;

beforeAll(async () => {
  await deleteAllRecords();

  userAndDevice = await createUserWithWorkspace({
    username,
    password,
  });
  workspace1Id = userAndDevice.workspace.id;
});

test("no unauthorized members when workspace created", async () => {
  const result = await getUnauthorizedMember({
    graphql,
    input: { workspaceIds: [workspace1Id] },
    sessionKey: userAndDevice.sessionKey,
  });
  expect(result.unauthorizedMember).toBe(null);
});

test("unauthorized members when workspace added", async () => {
  const otherUserAndDevice = await createUserWithWorkspace({
    username: `${generateId()}@example.com`,
    password,
  });
  const workspaceInvitationResult = await createWorkspaceInvitation({
    graphql,
    role: Role.VIEWER,
    workspaceId: workspace1Id,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userAndDevice.sessionKey,
    }).authorization,
    mainDevice: userAndDevice.mainDevice,
  });
  const invitationId =
    workspaceInvitationResult.createWorkspaceInvitation.workspaceInvitation.id;

  await acceptWorkspaceInvitation({
    graphql,
    invitationId,
    inviteeMainDevice: otherUserAndDevice.mainDevice,
    invitationSigningKeyPairSeed:
      workspaceInvitationResult.invitationSigningKeyPairSeed,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: otherUserAndDevice.sessionKey,
    }).authorization,
  });
  const result = await getUnauthorizedMember({
    graphql,
    input: { workspaceIds: [workspace1Id] },
    sessionKey: userAndDevice.sessionKey,
  });
  expect(result.unauthorizedMember).toBeDefined();
  expect(result.unauthorizedMember.userId).toBeDefined();
});

test("Unauthenticated", async () => {
  await expect(
    (async () =>
      await getUnauthorizedMember({
        graphql,
        input: { workspaceIds: [workspace1Id] },
        sessionKey: "badauthheader",
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});
