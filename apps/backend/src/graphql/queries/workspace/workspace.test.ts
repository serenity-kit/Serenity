import { gql } from "graphql-request";
import { v4 as uuidv4 } from "uuid";
import { registerUser } from "../../../../test/helpers/authentication/registerUser";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { createInitialWorkspaceStructure } from "../../../../test/helpers/workspace/createInitialWorkspaceStructure";

const graphql = setupGraphql();
const username = "7dfb4dd9-88be-414c-8a40-b5c030003d89@example.com";
const password = "password";
let sessionKey = "";
let device: any = null;

const workspace1Name = "workspace 1";
const workspace2Name = "workspace 2";
const workspace1Id = "4e9a4c29-2295-471c-84b5-5bf55169ff8c";
const workspace2Id = "a0856379-ad08-4dc5-baf5-ab93c9f7b5e5";

const setup = async () => {
  const registerUserResult = await registerUser(graphql, username, password);
  sessionKey = registerUserResult.sessionKey;
  device = registerUserResult.mainDevice;
  await createInitialWorkspaceStructure({
    workspaceName: workspace1Name,
    workspaceId: workspace1Id,
    deviceSigningPublicKey: registerUserResult.mainDevice.signingPublicKey,
    deviceEncryptionPublicKey:
      registerUserResult.mainDevice.encryptionPublicKey,
    deviceEncryptionPrivateKey: registerUserResult.encryptionPrivateKey,
    folderId: uuidv4(),
    folderIdSignature: `TODO+${uuidv4()}`,
    folderName: "Getting started",
    documentName: "Introduction",
    documentId: uuidv4(),
    graphql,
    authorizationHeader: sessionKey,
  });
  await createInitialWorkspaceStructure({
    workspaceName: workspace2Name,
    workspaceId: workspace2Id,
    deviceSigningPublicKey: registerUserResult.mainDevice.signingPublicKey,
    deviceEncryptionPrivateKey: registerUserResult.encryptionPrivateKey,
    deviceEncryptionPublicKey:
      registerUserResult.mainDevice.encryptionPublicKey,
    folderId: uuidv4(),
    folderIdSignature: `TODO+${uuidv4()}`,
    folderName: "Getting started",
    documentName: "Introduction",
    documentId: uuidv4(),
    graphql,
    authorizationHeader: sessionKey,
  });
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

type GetWorkspaceProps = {
  workspaceId?: string;
  deviceSigningPublicKey: string;
  authorizationHeader: string;
};
const getWorkspace = async ({
  workspaceId,
  deviceSigningPublicKey,
  authorizationHeader,
}: GetWorkspaceProps) => {
  const headers = { authorization: authorizationHeader };
  const query = gql`
    query workspace($id: ID, $deviceSigningPublicKey: String!) {
      workspace(id: $id, deviceSigningPublicKey: $deviceSigningPublicKey) {
        id
        name
        currentWorkspaceKey {
          id
          workspaceId
          workspaceKeyBox {
            id
            workspaceKeyId
            deviceSigningPublicKey
            creatorDeviceSigningPublicKey
            ciphertext
            creatorDevice {
              signingPublicKey
              encryptionPublicKey
            }
          }
        }
      }
    }
  `;
  const result = await graphql.client.request(
    query,
    { id: workspaceId, deviceSigningPublicKey },
    headers
  );
  return result;
};

test("user should be able to get a workspace by id", async () => {
  const result = await getWorkspace({
    workspaceId: workspace2Id,
    authorizationHeader: sessionKey,
    deviceSigningPublicKey: device.signingPublicKey,
  });
  const workspace = result.workspace;
  expect(workspace.id).toBe(workspace2Id);
  expect(workspace.name).toBe(workspace2Name);
  expect(typeof workspace.currentWorkspaceKey.id).toBe("string");
  expect(workspace.currentWorkspaceKey.workspaceId).toBe(workspace2Id);
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
    workspaceId: undefined,
    authorizationHeader: sessionKey,
    deviceSigningPublicKey: device.signingPublicKey,
  });
  const workspace = result.workspace;
  expect(workspace.id).toBe(workspace1Id);
  expect(workspace.name).toBe(workspace1Name);
  expect(typeof workspace.currentWorkspaceKey.id).toBe("string");
  expect(workspace.currentWorkspaceKey.workspaceId).toBe(workspace1Id);
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
        workspaceId: undefined,
        authorizationHeader: "badauthtoken",
        deviceSigningPublicKey: device.signingPublicKey,
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});
