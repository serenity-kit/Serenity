import {
  decryptWorkspaceInfo,
  deriveSessionAuthorization,
  generateId,
} from "@serenity-tools/common";
import { gql } from "graphql-request";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { updateWorkspaceName } from "../../../../test/helpers/workspace/updateWorkspaceName";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";
import { getWorkspaceMemberDevicesProof } from "../../../database/workspace/getWorkspaceMemberDevicesProof";

const graphql = setupGraphql();
let userData1: any = undefined;
let userData2: any = undefined;
const password = "password22room5K42";
let sessionKey1 = "";
let sessionKey2 = "";

const setup = async () => {
  userData1 = await createUserWithWorkspace({
    username: `${generateId()}@example.com`,
    password,
  });
  sessionKey1 = userData1.sessionKey;

  userData2 = await createUserWithWorkspace({
    username: `${generateId()}@example.com`,
    password,
  });
  sessionKey2 = userData1.sessionKey;
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("user can change workspace name", async () => {
  const name = "workspace 2";
  const workspaceMemberDevicesProof = await getWorkspaceMemberDevicesProof({
    userId: userData1.user.id,
    workspaceId: userData1.workspace.id,
  });
  const result = await updateWorkspaceName({
    graphql,
    id: userData1.workspace.id,
    name,
    workspaceKey: userData1.workspaceKey,
    workspaceKeyId: userData1.workspaceKeyId,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
    device: userData1.webDevice,
    workspaceMemberDevicesProof: workspaceMemberDevicesProof.proof,
  });
  const workspace = result.updateWorkspaceName.workspace;
  const decryptedWorkspaceInfo = decryptWorkspaceInfo({
    ciphertext: workspace.infoCiphertext,
    nonce: workspace.infoNonce,
    key: userData1.workspaceKey,
    creatorDeviceSigningPublicKey: userData1.webDevice.signingPublicKey,
    workspaceId: userData1.workspace.id,
    workspaceKeyId: userData1.workspaceKeyId,
    workspaceMemberDevicesProof: workspaceMemberDevicesProof.proof,
    signature: workspace.infoSignature,
  });
  expect(decryptedWorkspaceInfo.name).toBe(name);
});

test("user should not be able to update a workspace they don't own", async () => {
  // generate a challenge code
  const authorizationHeader = deriveSessionAuthorization({
    sessionKey: sessionKey2,
  }).authorization;
  const id = "abc";
  const name = "unauthorized workspace";
  const workspaceMemberDevicesProof = await getWorkspaceMemberDevicesProof({
    userId: userData1.user.id,
    workspaceId: userData1.workspace.id,
  });
  await expect(
    (async () =>
      await updateWorkspaceName({
        graphql,
        id,
        name,
        workspaceKey: userData1.workspaceKey,
        workspaceKeyId: userData1.workspaceKeyId,
        authorizationHeader,
        device: userData1.webDevice,
        workspaceMemberDevicesProof: workspaceMemberDevicesProof.proof,
      }))()
  ).rejects.toThrow("Unauthorized");
});

test("user should not be able to update a workspace for a workspace that doesn't exist", async () => {
  // generate a challenge code
  const authorizationHeader = deriveSessionAuthorization({
    sessionKey: sessionKey1,
  }).authorization;
  const id = "hahahaha";
  const name = "nonexistent workspace";
  const workspaceMemberDevicesProof = await getWorkspaceMemberDevicesProof({
    userId: userData1.user.id,
    workspaceId: userData1.workspace.id,
  });
  await expect(
    (async () =>
      await updateWorkspaceName({
        graphql,
        id,
        name,
        workspaceKey: userData1.workspaceKey,
        workspaceKeyId: userData1.workspaceKeyId,
        authorizationHeader,
        device: userData1.webDevice,
        workspaceMemberDevicesProof: workspaceMemberDevicesProof.proof,
      }))()
  ).rejects.toThrow("Unauthorized");
});

test("Unauthenticated", async () => {
  const id = userData1.workspace.id;
  const name = "unautharized workspace";
  const workspaceMemberDevicesProof = await getWorkspaceMemberDevicesProof({
    userId: userData1.user.id,
    workspaceId: userData1.workspace.id,
  });
  await expect(
    (async () =>
      await updateWorkspaceName({
        graphql,
        id,
        name,
        workspaceKey: userData1.workspaceKey,
        workspaceKeyId: userData1.workspaceKeyId,
        authorizationHeader: "badauthheader",
        device: userData1.webDevice,
        workspaceMemberDevicesProof: workspaceMemberDevicesProof.proof,
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

describe("Input errors", () => {
  const query = gql`
    mutation updateWorkspaceName($input: UpdateWorkspaceNameInput!) {
      updateWorkspaceName(input: $input) {
        workspace {
          id
          infoCiphertext
          infoNonce
          infoSignature
          infoWorkspaceMemberDevicesProofHash
          infoCreatorDeviceSigningPublicKey
          infoWorkspaceKey {
            id
            workspaceId
            generation
            workspaceKeyBox {
              id
              workspaceKeyId
              deviceSigningPublicKey
              ciphertext
              nonce
              creatorDevice {
                signingPublicKey
                encryptionPublicKey
              }
            }
          }
        }
      }
    }
  `;
  test("Invalid input", async () => {
    const authorizationHeaders = {
      authorization: sessionKey1,
    };
    await expect(
      (async () =>
        await graphql.client.request<any>(
          query,
          { input: null },
          authorizationHeaders
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("No input", async () => {
    const authorizationHeaders = {
      authorization: sessionKey1,
    };
    await expect(
      (async () =>
        await graphql.client.request<any>(
          query,
          undefined,
          authorizationHeaders
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
});
