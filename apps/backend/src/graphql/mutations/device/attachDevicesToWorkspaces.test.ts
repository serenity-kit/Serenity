import { v4 as uuidv4 } from "uuid";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { attachDevicesToWorkspaces } from "../../../../test/helpers/device/attachDevicesToWorkspaces";
import { decryptWorkspaceKey } from "../../../../test/helpers/device/decryptWorkspaceKey";
import { encryptWorkspaceKeyForDevice } from "../../../../test/helpers/device/encryptWorkspaceKeyForDevice";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { acceptWorkspaceInvitation } from "../../../../test/helpers/workspace/acceptWorkspaceInvitation";
import { createWorkspaceInvitation } from "../../../../test/helpers/workspace/createWorkspaceInvitation";
import { prisma } from "../../../database/prisma";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";
import { WorkspaceMemberDevices } from "../../../types/workspaceDevice";

const graphql = setupGraphql();
const username1 = `${uuidv4()}@example.com`;
let userAndDevice1: any;

beforeAll(async () => {
  await deleteAllRecords();
  userAndDevice1 = await createUserWithWorkspace({
    id: uuidv4(),
    username: username1,
  });
});

test("Existing workspace does nothing", async () => {
  const authorizationHeader = userAndDevice1.sessionKey;
  const workspaceId = userAndDevice1.workspace.id;
  const userAndDevice2 = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
  });
  const workspaceInvitationResult = await createWorkspaceInvitation({
    graphql,
    workspaceId,
    authorizationHeader,
  });
  const workspaceInvitationId =
    workspaceInvitationResult.createWorkspaceInvitation.workspaceInvitation.id;
  await acceptWorkspaceInvitation({
    graphql,
    workspaceInvitationId,
    authorizationHeader: userAndDevice2.sessionKey,
  });
  // now we create workspacekeyboxes for the new user.
  const workspaceKey = await prisma.workspaceKey.findFirst({
    where: { workspaceId },
    orderBy: { generation: "desc" },
    include: {
      workspaceKeyBoxes: {
        where: {
          deviceSigningPublicKey: userAndDevice1.device.signingPublicKey,
        },
      },
    },
  });
  const workspaceKeyBox = workspaceKey?.workspaceKeyBoxes[0];
  if (!workspaceKeyBox) {
    throw new Error("No workspaceKeyBox for workspace!");
  }
  const decryptedWorkspaceKey = await decryptWorkspaceKey({
    ciphertext: workspaceKeyBox.ciphertext,
    nonce: workspaceKeyBox.nonce,
    creatorDeviceEncryptionPublicKey: userAndDevice1.device.encryptionPublicKey,
    receiverDeviceEncryptionPrivateKey: userAndDevice1.encryptionPrivateKey,
  });
  const { nonce, ciphertext } = await encryptWorkspaceKeyForDevice({
    workspaceKey: decryptedWorkspaceKey,
    receiverDeviceEncryptionPublicKey:
      userAndDevice2.device.encryptionPublicKey,
    creatorDeviceEncryptionPrivateKey: userAndDevice1.encryptionPrivateKey,
  });
  const workspaceMemberDevices: WorkspaceMemberDevices[] = [
    {
      id: workspaceId,
      members: [
        {
          id: userAndDevice2.user.id,
          workspaceDevices: [
            {
              receiverDeviceSigningPublicKey:
                userAndDevice2.device.signingPublicKey,
              nonce,
              ciphertext,
            },
          ],
        },
      ],
    },
  ];
  const response = await attachDevicesToWorkspaces({
    graphql,
    creatorDeviceSigningPublicKey: userAndDevice1.device.signingPublicKey,
    workspaceMemberDevices,
    authorizationHeader,
  });
  const worskpaces = response.attachDevicesToWorkspaces.workspaces;
  expect(worskpaces.length).toBe(1);
  const workspace = worskpaces[0];
  expect(workspace.id).toBe(workspaceId);
  expect(workspace.workspaceKeys.length).toBe(1);
  const retrievedWorkspaceKey = workspace.workspaceKeys[0];
  expect(retrievedWorkspaceKey.generation).toBe(0);
  expect(retrievedWorkspaceKey.members.length).toBe(1);
  const member = retrievedWorkspaceKey.members[0];
  expect(member.id).toBe(userAndDevice2.user.id);
  expect(member.workspaceKeyBoxes.length).toBe(1);
  const retrievedWorkspaceKeyBox = member.workspaceKeyBoxes[0];
  expect(typeof retrievedWorkspaceKeyBox.id).toBe("string");
  expect(retrievedWorkspaceKeyBox.ciphertext).toBe(ciphertext);
  expect(retrievedWorkspaceKeyBox.nonce).toBe(nonce);
  expect(retrievedWorkspaceKeyBox.deviceSigningPublicKey).toBe(
    userAndDevice2.device.signingPublicKey
  );
  expect(retrievedWorkspaceKeyBox.creatorDeviceSigningPublicKey).toBe(
    userAndDevice1.device.signingPublicKey
  );
});
