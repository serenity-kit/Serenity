import { v4 as uuidv4 } from "uuid";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { getWorkspaceKeyForWorkspaceAndDevice } from "../../../../test/helpers/device/getWorkspaceKeyForWorkspaceAndDevice";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { createInitialWorkspaceStructure } from "../../../../test/helpers/workspace/createInitialWorkspaceStructure";
import { getWorkspace } from "../../../../test/helpers/workspace/getWorkspace";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
const password = "password";
let user1Data: any = undefined;
let user1WorkspaceKey = "";
let otherWorkspace: any = undefined;

const workspace1Id = "4e9a4c29-2295-471c-84b5-5bf55169ff8c";
const workspace2Id = "a0856379-ad08-4dc5-baf5-ab93c9f7b5e5";

const setup = async () => {
  user1Data = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
    password,
  });
  user1WorkspaceKey = await getWorkspaceKeyForWorkspaceAndDevice({
    device: user1Data.device,
    deviceEncryptionPrivateKey: user1Data.encryptionPrivateKey,
    workspace: user1Data.workspace,
  });
  const otherWorkspaceResponse = await createInitialWorkspaceStructure({
    graphql,
    workspace: {
      id: uuidv4(),
      name: "workspace1",
    },
    folder: {
      id: uuidv4(),
      idSignature: `TOOD:${uuidv4()}`,
      name: "Getting Started",
    },
    document: {
      id: uuidv4(),
      name: "Introduction",
    },
    creatorDevice: {
      encryptionPrivateKey: user1Data.deviceEncryptionPrivateKey,
      signingPrivateKey: user1Data.deviceSigningPrivateKey,
      ...user1Data.device,
    },
    webDevice: user1Data.webDevice,
    authorizationHeader: user1Data.sessionKey,
  });
  otherWorkspace =
    otherWorkspaceResponse.createInitialWorkspaceStructure.workspace;
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("user should be able to get a workspace by id", async () => {
  const result = await getWorkspace({
    graphql,
    workspaceId: otherWorkspace.id,
    authorizationHeader: user1Data.sessionKey,
    deviceSigningPublicKey: user1Data.device.signingPublicKey,
  });
  const workspace = result.workspace;
  expect(workspace.id).toBe(otherWorkspace.id);
  expect(workspace.name).toBe(otherWorkspace.name);
  expect(typeof workspace.currentWorkspaceKey.id).toBe("string");
  expect(workspace.currentWorkspaceKey.workspaceId).toBe(otherWorkspace.id);
  const workspaceKeyBox = workspace.currentWorkspaceKey.workspaceKeyBox;
  expect(workspaceKeyBox.deviceSigningPublicKey).toBe(
    user1Data.device.signingPublicKey
  );

  expect(workspaceKeyBox?.creatorDevice?.signingPublicKey).toBe(
    workspaceKeyBox?.creatorDeviceSigningPublicKey
  );
  expect(workspaceKeyBox?.creatorDevice?.signingPublicKey).toBe(
    user1Data.device.signingPublicKey
  );
  expect(typeof workspaceKeyBox.ciphertext).toBe("string");
  expect(workspaceKeyBox.workspaceKeyId).toBe(workspace.currentWorkspaceKey.id);
});

test("user should get a workspace without providing an id", async () => {
  const result = await getWorkspace({
    graphql,
    workspaceId: undefined,
    authorizationHeader: user1Data.sessionKey,
    deviceSigningPublicKey: user1Data.device.signingPublicKey,
  });
  const workspace = result.workspace;
  expect(workspace.id).toBe(user1Data.workspace.id);
  expect(workspace.name).toBe(user1Data.workspace.name);
  expect(typeof workspace.currentWorkspaceKey.id).toBe("string");
  expect(workspace.currentWorkspaceKey.workspaceId).toBe(
    user1Data.workspace.id
  );
  const workspaceKeyBox = workspace.currentWorkspaceKey.workspaceKeyBox;
  expect(workspaceKeyBox.deviceSigningPublicKey).toBe(
    user1Data.device.signingPublicKey
  );
  expect(workspaceKeyBox?.creatorDevice?.signingPublicKey).toBe(
    workspaceKeyBox?.creatorDeviceSigningPublicKey
  );
  expect(workspaceKeyBox?.creatorDevice?.signingPublicKey).toBe(
    user1Data.device.signingPublicKey
  );
  expect(typeof workspaceKeyBox.ciphertext).toBe("string");
  expect(workspaceKeyBox.workspaceKeyId).toBe(
    user1Data.workspace.currentWorkspaceKey.id
  );
});

test("User should not be able to retrieve a workspace for another device", async () => {
  await expect(
    (async () =>
      await getWorkspace({
        graphql,
        workspaceId: undefined,
        authorizationHeader: user1Data.sessionKey,
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
        deviceSigningPublicKey: user1Data.device.signingPublicKey,
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});
