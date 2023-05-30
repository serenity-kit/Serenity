import { generateId } from "@serenity-tools/common";
import { gql } from "graphql-request";
import { Role } from "../../../../prisma/generated/output";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { acceptWorkspaceInvitation } from "../../../../test/helpers/workspace/acceptWorkspaceInvitation";
import { createWorkspaceInvitation } from "../../../../test/helpers/workspace/createWorkspaceInvitation";
import { updateWorkspaceMembersRoles } from "../../../../test/helpers/workspace/updateWorkspaceMembersRoles";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
let userData1: any = undefined;
let userData2: any = undefined;

const setup = async () => {
  userData1 = await createUserWithWorkspace({
    id: generateId(),
    username: `${generateId()}@example.com`,
    password: "password",
  });
  userData2 = await createUserWithWorkspace({
    id: generateId(),
    username: `${generateId()}@example.com`,
    password: "password",
  });
  const workspaceInvitationResult = await createWorkspaceInvitation({
    graphql,
    role: Role.VIEWER,
    workspaceId: userData1.workspace.id,
    authorizationHeader: userData1.sessionKey,
    mainDevice: userData1.mainDevice,
  });
  const invitationId =
    workspaceInvitationResult.createWorkspaceInvitation.workspaceInvitation.id;
  await acceptWorkspaceInvitation({
    graphql,
    invitationId,
    inviteeMainDevice: userData2.mainDevice,
    invitationSigningKeyPairSeed:
      workspaceInvitationResult.invitationSigningKeyPairSeed,
    authorizationHeader: userData2.sessionKey,
  });
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("user won't update empty members", async () => {
  // generate a challenge code
  const authorizationHeader = userData1.sessionKey;
  const members = [];
  const result = await updateWorkspaceMembersRoles({
    graphql,
    id: userData1.workspace.id,
    members,
    authorizationHeader,
  });
  const workspace = result.updateWorkspaceMembersRoles.workspace;
  expect(workspace.members.length).toBe(2);
});

// WARNING: after this, user is no longer an admin on this workspace
test("user should be able to update a workspace, but not their own access level", async () => {
  // generate a challenge code
  const authorizationHeader = userData1.sessionKey;
  const members = [
    {
      userId: userData1.user.id,
      role: Role.EDITOR,
    },
    {
      userId: userData2.user.id,
      role: Role.EDITOR,
    },
  ];
  const result = await updateWorkspaceMembersRoles({
    graphql,
    id: userData1.workspace.id,
    members,
    authorizationHeader,
  });
  const workspace = result.updateWorkspaceMembersRoles.workspace;
  expect(workspace.members.length).toBe(2);
  workspace.members.forEach((member: { userId: string; role: Role }) => {
    if (member.userId === userData1.user.id) {
      expect(member.role).toBe(Role.ADMIN);
    } else {
      expect(member.role).not.toBe(Role.ADMIN);
    }
  });
});

test("user should not be able to update a workspace they don't own", async () => {
  // generate a challenge code
  const authorizationHeader = userData2.sessionKey;
  const members = [
    {
      userId: userData1.user.id,
      role: Role.ADMIN,
    },
    {
      userId: userData2.user.id,
      role: Role.ADMIN,
    },
  ];
  await expect(
    (async () =>
      await updateWorkspaceMembersRoles({
        graphql,
        id: userData1.workspace.id,
        members,
        authorizationHeader,
      }))()
  ).rejects.toThrow("Unauthorized");
});

test("user should not be able to update a workspace for a workspace that doesn't exist", async () => {
  // generate a challenge code
  const authorizationHeader = userData1.sessionKey;
  const id = "hahahaha";
  const members = [
    {
      userId: userData1.user.id,
      role: Role.EDITOR,
    },
    {
      userId: userData1.user.id,
      role: Role.ADMIN,
    },
  ];
  await expect(
    (async () =>
      await updateWorkspaceMembersRoles({
        graphql,
        id,
        members,
        authorizationHeader,
      }))()
  ).rejects.toThrow("Unauthorized");
});

test("Unauthenticated", async () => {
  const id = userData1.workspace.id;
  const members = [
    {
      userId: userData1.user.id,
      role: Role.EDITOR,
    },
  ];
  await expect(
    (async () =>
      await updateWorkspaceMembersRoles({
        graphql,
        id,
        members,
        authorizationHeader: "badauthheader",
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

describe("Input errors", () => {
  const query = gql`
    mutation updateWorkspaceMembersRoles(
      $input: UpdateWorkspaceMembersRolesInput!
    ) {
      updateWorkspaceMembersRoles(input: $input) {
        workspace {
          id
          name
          members {
            userId
            role
          }
        }
      }
    }
  `;
  test("Invalid id", async () => {
    const members = [
      {
        userId: userData1.user.id,
        role: Role.ADMIN,
      },
    ];
    const authorizationHeaders = {
      authorization: userData1.sessionKey,
    };
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          { input: { id: null, members } },
          authorizationHeaders
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("Invalid input", async () => {
    const authorizationHeaders = {
      authorization: userData1.sessionKey,
    };
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          { input: null },
          authorizationHeaders
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("No input", async () => {
    const authorizationHeaders = {
      authorization: userData1.sessionKey,
    };
    await expect(
      (async () =>
        await graphql.client.request(query, null, authorizationHeaders))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
});
