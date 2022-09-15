import { v4 as uuidv4 } from "uuid";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { getRelatedDeviceBySigningPublicKey } from "../../../../test/helpers/device/getRelatedDeviceBySigningPublicKey";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { acceptWorkspaceInvitation } from "../../../../test/helpers/workspace/acceptWorkspaceInvitation";
import { createWorkspaceInvitation } from "../../../../test/helpers/workspace/createWorkspaceInvitation";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
let userId = "";
let workspaceId = "";
let userData1: any = undefined;
let userData2: any = undefined;

beforeAll(async () => {
  await deleteAllRecords();
  const result1 = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
  });
  const result2 = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
  });
  userData1 = result1;
  userData2 = result2;
  workspaceId = result1.workspace.id;
});

test("user should be retrieve a device by signingPublicKey", async () => {
  const authorizationHeader = userData1.sessionKey;
  const device = userData1.device;
  const result = await getRelatedDeviceBySigningPublicKey({
    graphql,
    signingPublicKey: device.signingPublicKey,
    authorizationHeader,
  });
  const retrivedDevice = result.relatedDeviceBySigningPublicKey.device;
  expect(retrivedDevice).toMatchInlineSnapshot(`
    {
      "encryptionPublicKey": "${device.encryptionPublicKey}",
      "encryptionPublicKeySignature": "${device.encryptionPublicKeySignature}",
      "signingPublicKey": "${device.signingPublicKey}",
      "userId": "${userData1.user.id}",
    }
  `);
});

test("fail another user's device unattached workspace", async () => {
  const authorizationHeader = userData1.sessionKey;
  await expect(
    (async () =>
      await getRelatedDeviceBySigningPublicKey({
        graphql,
        signingPublicKey: userData2.device.signingPublicKey,
        authorizationHeader,
      }))()
  ).rejects.toThrowError(/Unauthorized/);
});

test("retrieve a another user's device same workspace", async () => {
  const authorizationHeader = userData1.sessionKey;
  const createWorkspaceResult = await createWorkspaceInvitation({
    graphql,
    workspaceId,
    authorizationHeader,
  });
  const workspaceInvitation =
    createWorkspaceResult.createWorkspaceInvitation.workspaceInvitation;
  await acceptWorkspaceInvitation({
    graphql,
    workspaceInvitationId: workspaceInvitation.id,
    authorizationHeader: userData2.sessionKey,
  });
  const result = await getRelatedDeviceBySigningPublicKey({
    graphql,
    signingPublicKey: userData2.device.signingPublicKey,
    authorizationHeader,
  });
  const retrivedDevice = result.relatedDeviceBySigningPublicKey.device;
  const device = userData2.device;
  expect(retrivedDevice).toMatchInlineSnapshot(`
  {
    "encryptionPublicKey": "${device.encryptionPublicKey}",
    "encryptionPublicKeySignature": "${device.encryptionPublicKeySignature}",
    "signingPublicKey": "${device.signingPublicKey}",
    "userId": "${userData2.user.id}",
  }
`);
});

test("Unauthenticated", async () => {
  await expect(
    (async () =>
      await getRelatedDeviceBySigningPublicKey({
        graphql,
        signingPublicKey: userData1.device.signingPublicKey,
        authorizationHeader: "badauthheader",
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});
