import setupGraphql from "../../../../test/helpers/setupGraphql";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { createDevice } from "../../../../test/helpers/device/createDevice";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";
import { attachDeviceToWorkspace } from "../../../../test/helpers/device/attachDeviceToWorkspace";
import { WorkspaceKey } from "../../../types/workspace";
import { createAeadKeyAndCipherTextForDevice } from "../../../../test/helpers/device/createAeadKeyAndCipherTextForDevice";
import { prisma } from "../../../database/prisma";

const graphql = setupGraphql();
const username1 = "user1";
let userAndDevice1: any;

beforeAll(async () => {
  await deleteAllRecords();
  userAndDevice1 = await createUserWithWorkspace({
    id: "5a3484e6-c46e-42ce-a285-088fc1fd6915",
    username: username1,
  });
});

test("attach a device to a workspace", async () => {
  const authorizationHeader = userAndDevice1.sessionKey;
  const deviceSigningPublicKey = userAndDevice1.device.signingPublicKey;
  const deviceEncryptionPublicKey = userAndDevice1.device.encryptionPublicKey;
  const { ciphertext } = await createAeadKeyAndCipherTextForDevice({
    deviceEncryptionPublicKey,
  });
  const workspaceId = userAndDevice1.workspace.id;
  const result = await attachDeviceToWorkspace({
    graphql,
    workspaceId,
    deviceSigningPublicKey,
    deviceAeadCiphertext: ciphertext,
    authorizationHeader,
  });
  const workspaceKey: WorkspaceKey =
    result.attachDeviceToWorkspace.workspaceKey;
  expect(typeof workspaceKey.id).toBe("string");
  expect(workspaceKey.generation).toBe(0);
  expect(workspaceKey.workspaceId).toBe(workspaceId);
  // This query will return the newly created workspaceKeyId
  const workspaceKeyBox = workspaceKey.workspaceKeyBox;
  expect(workspaceKeyBox?.ciphertext).toBe(ciphertext);
  expect(workspaceKeyBox?.deviceSigningPublicKey).toBe(deviceSigningPublicKey);
  // there should now be two workspacKeyBoxes
  const workspaceKeyBoxes = await prisma.workspaceKeyBox.findMany({
    where: {
      workspaceKeyId: workspaceKey.id,
    },
  });
  expect(workspaceKeyBoxes?.length).toBe(2);
});

test("Unauthenticated", async () => {
  const authorizationHeader = "";
  await expect(
    (async () =>
      await createDevice({
        graphql,
        authorizationHeader,
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});
