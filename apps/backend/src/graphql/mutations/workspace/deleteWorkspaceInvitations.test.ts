import * as workspaceChain from "@serenity-kit/workspace-chain";
import { gql } from "graphql-request";
import sodium from "react-native-libsodium";
import { Role } from "../../../../prisma/generated/output";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { acceptWorkspaceInvitation } from "../../../../test/helpers/workspace/acceptWorkspaceInvitation";
import { createWorkspaceInvitation } from "../../../../test/helpers/workspace/createWorkspaceInvitation";
import { deleteWorkspaceInvitations } from "../../../../test/helpers/workspace/deleteWorkspaceInvitations";
import { getLastWorkspaceChainEvent } from "../../../../test/helpers/workspace/getLastWorkspaceChainEvent";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
const username1 = "user11@example.com";
const username2 = "user21@example.com";
let userAndDevice1: any = null;
let userAndDevice2: any = null;

beforeEach(async () => {
  await deleteAllRecords();
  userAndDevice1 = await createUserWithWorkspace({
    username: username1,
  });
  userAndDevice2 = await createUserWithWorkspace({
    username: username2,
  });
});

test("user should be able to delete a workspace invitation they created", async () => {
  const workspaceInvitationResult = await createWorkspaceInvitation({
    graphql,
    role: Role.VIEWER,
    workspaceId: userAndDevice1.workspace.id,
    authorizationHeader: userAndDevice1.sessionKey,
    mainDevice: userAndDevice1.mainDevice,
  });
  const workspaceInvitationId =
    workspaceInvitationResult.createWorkspaceInvitation.workspaceInvitation.id;

  const { lastChainEntry } = await getLastWorkspaceChainEvent({
    workspaceId: userAndDevice1.workspace.id,
  });
  const removeInvitationEvent = workspaceChain.removeInvitations({
    prevHash: workspaceChain.hashTransaction(lastChainEntry.transaction),
    authorKeyPair: {
      keyType: "ed25519",
      privateKey: sodium.from_base64(
        userAndDevice1.mainDevice.signingPrivateKey
      ),
      publicKey: sodium.from_base64(userAndDevice1.mainDevice.signingPublicKey),
    },
    invitationIds: [workspaceInvitationId],
  });

  const deleteWorkspaceInvitationResult = await deleteWorkspaceInvitations({
    graphql,
    workspaceChainEvent: removeInvitationEvent,
    authorizationHeader: userAndDevice1.sessionKey,
    mainDevice: userAndDevice1.mainDevice,
    workspaceId: userAndDevice1.workspace.id,
  });
  expect(deleteWorkspaceInvitationResult.deleteWorkspaceInvitations)
    .toMatchInlineSnapshot(`
    {
      "status": "success",
    }
  `);
});

test("user should not be able to delete a workspace invitation if they aren't admin", async () => {
  // add user2 as an editor for workspace 1
  const workspaceInvitationResult = await createWorkspaceInvitation({
    graphql,
    role: "EDITOR",
    workspaceId: userAndDevice1.workspace.id,
    authorizationHeader: userAndDevice1.sessionKey,
    mainDevice: userAndDevice1.mainDevice,
  });
  const invitationId =
    workspaceInvitationResult.createWorkspaceInvitation.workspaceInvitation.id;

  await acceptWorkspaceInvitation({
    graphql,
    invitationId,
    inviteeMainDevice: userAndDevice2.mainDevice,
    invitationSigningKeyPairSeed:
      workspaceInvitationResult.invitationSigningKeyPairSeed,
    authorizationHeader: userAndDevice2.sessionKey,
  });
  const { lastChainEntry } = await getLastWorkspaceChainEvent({
    workspaceId: userAndDevice1.workspace.id,
  });
  const removeInvitationEvent = workspaceChain.removeInvitations({
    prevHash: workspaceChain.hashTransaction(lastChainEntry.transaction),
    authorKeyPair: {
      keyType: "ed25519",
      privateKey: sodium.from_base64(
        userAndDevice2.mainDevice.signingPrivateKey
      ),
      publicKey: sodium.from_base64(userAndDevice2.mainDevice.signingPublicKey),
    },
    invitationIds: [invitationId],
  });

  await expect(
    (async () =>
      await deleteWorkspaceInvitations({
        graphql,
        workspaceChainEvent: removeInvitationEvent,
        authorizationHeader: userAndDevice2.sessionKey,
        mainDevice: userAndDevice1.mainDevice,
        workspaceId: userAndDevice1.workspace.id,
      }))()
  ).rejects.toThrowError();
});

test("Unauthenticated", async () => {
  const workspaceInvitationResult = await createWorkspaceInvitation({
    graphql,
    role: Role.VIEWER,
    workspaceId: userAndDevice1.workspace.id,
    authorizationHeader: userAndDevice1.sessionKey,
    mainDevice: userAndDevice1.mainDevice,
  });

  const workspaceInvitationId =
    workspaceInvitationResult.createWorkspaceInvitation.workspaceInvitation.id;

  const { lastChainEntry } = await getLastWorkspaceChainEvent({
    workspaceId: userAndDevice1.workspace.id,
  });
  const removeInvitationEvent = workspaceChain.removeInvitations({
    prevHash: workspaceChain.hashTransaction(lastChainEntry.transaction),
    authorKeyPair: {
      keyType: "ed25519",
      privateKey: sodium.from_base64(
        userAndDevice1.mainDevice.signingPrivateKey
      ),
      publicKey: sodium.from_base64(userAndDevice1.mainDevice.signingPublicKey),
    },
    invitationIds: [workspaceInvitationId],
  });

  await expect(
    (async () =>
      await deleteWorkspaceInvitations({
        graphql,
        workspaceChainEvent: removeInvitationEvent,
        authorizationHeader: "badauthheader",
        mainDevice: userAndDevice1.mainDevice,
        workspaceId: userAndDevice1.workspace.id,
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

describe("Input Errors", () => {
  const query = gql`
    mutation deleteWorkspaceInvitations(
      $input: DeleteWorkspaceInvitationsInput
    ) {
      deleteWorkspaceInvitations(input: $input) {
        status
      }
    }
  `;
  test("Invalid id", async () => {
    const authorizationHeaders = {
      authorization: userAndDevice1.sessionKey,
    };
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: {
              serializedWorkspaceChainEvent: null,
            },
          },
          authorizationHeaders
        ))()
    ).rejects.toThrowError(/GRAPHQL_VALIDATION_FAILED/);
  });
  test("Invalid input", async () => {
    const authorizationHeaders = {
      authorization: userAndDevice1.sessionKey,
    };
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          { input: null },
          authorizationHeaders
        ))()
    ).rejects.toThrowError(/GRAPHQL_VALIDATION_FAILED/);
  });
  test("No input", async () => {
    const authorizationHeaders = {
      authorization: userAndDevice1.sessionKey,
    };
    await expect(
      (async () =>
        await graphql.client.request(query, null, authorizationHeaders))()
    ).rejects.toThrowError(/GRAPHQL_VALIDATION_FAILED/);
  });
});
