import canonicalize from "canonicalize";
import { v4 as uuidv4 } from "uuid";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { updateWorkspaceInfo } from "../../../../test/helpers/workspace/updateWorkspaceInfo";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
let userData1: any = null;
let userData2: any = null;
const password1 = uuidv4();
const password2 = uuidv4();

beforeAll(async () => {
  await deleteAllRecords();
  userData1 = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
    password: password1,
  });
  userData2 = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
    password: password2,
  });
});

test("update info", async () => {
  const info = canonicalize({
    name: "test",
    id: "abc",
  });
  const devices = [userData1.mainDevice, userData1.webDevice];
  const updateWorkspaceInfoResult = await updateWorkspaceInfo({
    graphql,
    workspaceId: userData1.workspace.id,
    info: info!,
    creatorDevice: {
      ...userData1.mainDevice,
      encryptionPrivateKey: userData1.mainDevice.encryptionPrivateKey,
      signingPrivateKey: userData1.mainDevice.signingPrivateKey,
    },
    devices,
    authorizationHeader: userData1.sessionKey,
  });
  const updatedWorkspace =
    updateWorkspaceInfoResult.updateWorkspaceInfo.workspace;
  console.log({ updatedWorkspace });
  expect(updatedWorkspace.infoCiphertext).not.toBeNull();
  expect(updatedWorkspace.infoNonce).not.toBeNull();
  expect(updatedWorkspace.infoWorkspaceKeyId).not.toBeNull();
  const infoWorkspaceKey = updatedWorkspace.infoWorkspaceKey;
  expect(updatedWorkspace.infoWorkspaceKeyId).toBe(infoWorkspaceKey.id);
  expect(updatedWorkspace.generation).toBe(1);
  expect(updatedWorkspace.workspaceKeyBoxes.length).toBe(2);
});
