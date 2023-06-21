import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { createInitialWorkspaceStructure } from "../../../../test/helpers/workspace/createInitialWorkspaceStructure";
import { getWorkspace } from "../../../../test/helpers/workspace/getWorkspace";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
let userData1: any = undefined;
let otherWorkspace: any = undefined;
const username = "7dfb4dd9-88be-414c-8a40-b5c030003d89@example.com";
const password = "password";
let sessionKey = "";
let device: any = null;
let webDevice: any;

const workspace2Name = "workspace 2";
const workspace2Id = "a0856379-ad08-4dc5-baf5-ab93c9f7b5e5";

const setup = async () => {
  userData1 = await createUserWithWorkspace({
    username,
    password,
  });
  sessionKey = userData1.sessionKey;
  device = userData1.device;
  webDevice = userData1.webDevice;
  const createInitialWorkspaceStructureResult =
    await createInitialWorkspaceStructure({
      graphql,
      workspaceName: workspace2Name,
      creatorDevice: {
        ...userData1.device,
        encryptionPrivateKey: userData1.encryptionPrivateKey,
        signingPrivateKey: userData1.signingPrivateKey,
      },
      mainDevice: userData1.mainDevice,
      devices: [userData1.device, userData1.webDevice],
      authorizationHeader: sessionKey,
    });
  otherWorkspace =
    createInitialWorkspaceStructureResult.createInitialWorkspaceStructure;
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("user should be able to get a workspace by id", async () => {
  const result = await getWorkspace({
    graphql,
    workspaceId: otherWorkspace.workspace.id,
    authorizationHeader: sessionKey,
    deviceSigningPublicKey: device.signingPublicKey,
  });
  const workspace = result.workspace;
  expect(workspace.id).toBe(otherWorkspace.workspace.id);
  expect(workspace.name).toBe(workspace2Name);
  expect(typeof workspace.currentWorkspaceKey.id).toBe("string");
  expect(workspace.currentWorkspaceKey.workspaceId).toBe(
    otherWorkspace.workspace.id
  );
  const workspaceKeyBox = workspace.currentWorkspaceKey.workspaceKeyBox;
  expect(workspaceKeyBox.deviceSigningPublicKey).toBe(device.signingPublicKey);

  expect(workspaceKeyBox?.creatorDevice?.signingPublicKey).toBe(
    workspaceKeyBox?.creatorDeviceSigningPublicKey
  );
  expect(workspaceKeyBox?.creatorDevice?.signingPublicKey).toBe(
    device.signingPublicKey
  );
  expect(typeof workspaceKeyBox.ciphertext).toBe("string");
  expect(workspaceKeyBox.workspaceKeyId).toBe(workspace.currentWorkspaceKey.id);
});

test("user should get a workspace without providing an id", async () => {
  const result = await getWorkspace({
    graphql,
    workspaceId: undefined,
    authorizationHeader: sessionKey,
    deviceSigningPublicKey: device.signingPublicKey,
  });
  const workspace = result.workspace;
  expect(workspace.id).toBe(userData1.workspace.id);
  expect(workspace.name).toBe(userData1.workspace.name);
  expect(typeof workspace.currentWorkspaceKey.id).toBe("string");
  expect(workspace.currentWorkspaceKey.workspaceId).toBe(
    userData1.workspace.id
  );
  const workspaceKeyBox = workspace.currentWorkspaceKey.workspaceKeyBox;
  expect(workspaceKeyBox.deviceSigningPublicKey).toBe(device.signingPublicKey);
  expect(workspaceKeyBox?.creatorDevice?.signingPublicKey).toBe(
    workspaceKeyBox?.creatorDeviceSigningPublicKey
  );
  expect(workspaceKeyBox?.creatorDevice?.signingPublicKey).toBe(
    device.signingPublicKey
  );
  expect(typeof workspaceKeyBox.ciphertext).toBe("string");
  expect(workspaceKeyBox.workspaceKeyId).toBe(workspace.currentWorkspaceKey.id);
});

test("User should not be able to retrieve a workspace for another device", async () => {
  await expect(
    (async () =>
      await getWorkspace({
        graphql,
        workspaceId: undefined,
        authorizationHeader: sessionKey,
        deviceSigningPublicKey: "abcd",
      }))()
  ).rejects.toThrowError(/Internal server error/);
});

test("Unauthenticated", async () => {
  await expect(
    (async () =>
      await getWorkspace({
        graphql,
        workspaceId: undefined,
        authorizationHeader: "badauthtoken",
        deviceSigningPublicKey: device.signingPublicKey,
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});
