import * as workspaceChain from "@serenity-kit/workspace-chain";
import { deriveSessionAuthorization, generateId } from "@serenity-tools/common";
import { gql } from "graphql-request";
import sodium from "libsodium-wrappers";
import { Role } from "../../../../prisma/generated/output";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { acceptWorkspaceInvitation } from "../../../../test/helpers/workspace/acceptWorkspaceInvitation";
import { createWorkspaceInvitation } from "../../../../test/helpers/workspace/createWorkspaceInvitation";
import { getLastWorkspaceChainEvent } from "../../../../test/helpers/workspace/getLastWorkspaceChainEvent";
import { updateWorkspaceMemberRole } from "../../../../test/helpers/workspace/updateWorkspaceMemberRole";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
let userData1: any = undefined;
let userData2: any = undefined;

beforeEach(async () => {
  await deleteAllRecords();

  userData1 = await createUserWithWorkspace({
    username: `${generateId()}@example.com`,
    password: "password",
  });
  userData2 = await createUserWithWorkspace({
    username: `${generateId()}@example.com`,
    password: "password",
  });
  const workspaceInvitationResult = await createWorkspaceInvitation({
    graphql,
    role: Role.VIEWER,
    workspaceId: userData1.workspace.id,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
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
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData2.sessionKey,
    }).authorization,
  });
});

test("update a workspace member role", async () => {
  const { lastChainEntry } = await getLastWorkspaceChainEvent({
    workspaceId: userData1.workspace.id,
  });
  const updateMemberEvent = workspaceChain.updateMember(
    workspaceChain.hashTransaction(lastChainEntry.transaction),
    {
      keyType: "ed25519",
      privateKey: sodium.from_base64(userData1.mainDevice.signingPrivateKey),
      publicKey: sodium.from_base64(userData1.mainDevice.signingPublicKey),
    },
    userData2.mainDevice.signingPublicKey,
    "ADMIN"
  );

  const result = await updateWorkspaceMemberRole({
    graphql,
    workspaceId: userData1.workspace.id,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
    workspaceChainEvent: updateMemberEvent,
    mainDevice: userData1.mainDevice,
  });
  // TODO improve by checking actual role instead of relying on success here
  expect(result.updateWorkspaceMemberRole.workspace).toBeDefined();
});

test("update my own workspace member role", async () => {
  const { lastChainEntry } = await getLastWorkspaceChainEvent({
    workspaceId: userData1.workspace.id,
  });
  const updateMemberEvent = workspaceChain.updateMember(
    workspaceChain.hashTransaction(lastChainEntry.transaction),
    {
      keyType: "ed25519",
      privateKey: sodium.from_base64(userData1.mainDevice.signingPrivateKey),
      publicKey: sodium.from_base64(userData1.mainDevice.signingPublicKey),
    },
    userData2.mainDevice.signingPublicKey,
    "ADMIN"
  );
  await updateWorkspaceMemberRole({
    graphql,
    workspaceId: userData1.workspace.id,
    workspaceChainEvent: updateMemberEvent,
    mainDevice: userData1.mainDevice,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
  });

  const { lastChainEntry: lastChainEntry2 } = await getLastWorkspaceChainEvent({
    workspaceId: userData1.workspace.id,
  });
  const updateMemberEvent2 = workspaceChain.updateMember(
    workspaceChain.hashTransaction(lastChainEntry2.transaction),
    {
      keyType: "ed25519",
      privateKey: sodium.from_base64(userData1.mainDevice.signingPrivateKey),
      publicKey: sodium.from_base64(userData1.mainDevice.signingPublicKey),
    },
    userData1.mainDevice.signingPublicKey,
    "VIEWER"
  );
  const result2 = await updateWorkspaceMemberRole({
    graphql,
    workspaceId: userData1.workspace.id,
    workspaceChainEvent: updateMemberEvent2,
    mainDevice: userData1.mainDevice,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
  });

  // TODO improve by checking actual role instead of relying on success here
  expect(result2.updateWorkspaceMemberRole.workspace).toBeDefined();
});

test("user should not be able to update a workspace they don't own", async () => {
  const { lastChainEntry } = await getLastWorkspaceChainEvent({
    workspaceId: userData1.workspace.id,
  });
  const updateMemberEvent = workspaceChain.updateMember(
    workspaceChain.hashTransaction(lastChainEntry.transaction),
    {
      keyType: "ed25519",
      privateKey: sodium.from_base64(userData1.mainDevice.signingPrivateKey),
      publicKey: sodium.from_base64(userData1.mainDevice.signingPublicKey),
    },
    userData2.mainDevice.signingPublicKey,
    "ADMIN"
  );

  await expect(
    (async () =>
      await updateWorkspaceMemberRole({
        graphql,
        workspaceId: userData2.workspace.id,
        workspaceChainEvent: updateMemberEvent,
        mainDevice: userData1.mainDevice,
        authorizationHeader: deriveSessionAuthorization({
          sessionKey: userData1.sessionKey,
        }).authorization,
      }))()
  ).rejects.toThrow("Unauthorized");
});

test("Unauthenticated", async () => {
  const { lastChainEntry } = await getLastWorkspaceChainEvent({
    workspaceId: userData1.workspace.id,
  });
  const updateMemberEvent = workspaceChain.updateMember(
    workspaceChain.hashTransaction(lastChainEntry.transaction),
    {
      keyType: "ed25519",
      privateKey: sodium.from_base64(userData1.mainDevice.signingPrivateKey),
      publicKey: sodium.from_base64(userData1.mainDevice.signingPublicKey),
    },
    userData2.mainDevice.signingPublicKey,
    "ADMIN"
  );

  await expect(
    (async () =>
      await updateWorkspaceMemberRole({
        graphql,
        workspaceId: userData1.workspace.id,
        workspaceChainEvent: updateMemberEvent,
        mainDevice: userData1.mainDevice,
        authorizationHeader: "WRONG_SESSION",
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

describe("Input errors", () => {
  const query = gql`
    mutation updateWorkspaceMemberRole(
      $input: UpdateWorkspaceMemberRoleInput!
    ) {
      updateWorkspaceMemberRole(input: $input) {
        workspace {
          id
        }
      }
    }
  `;
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
