import {
  decryptWorkspaceKey,
  encryptWorkspaceKeyForDevice,
  generateId,
} from "@serenity-tools/common";
import { Role } from "../../../../prisma/generated/output";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { attachDevicesToWorkspaces } from "../../../../test/helpers/device/attachDevicesToWorkspaces";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { acceptWorkspaceInvitation } from "../../../../test/helpers/workspace/acceptWorkspaceInvitation";
import { createWorkspaceInvitation } from "../../../../test/helpers/workspace/createWorkspaceInvitation";
import { prisma } from "../../../database/prisma";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";
import { WorkspaceMemberDevices } from "../../../types/workspaceDevice";

const graphql = setupGraphql();
const username1 = `${generateId()}@example.com`;
let userAndDevice1: any;

beforeAll(async () => {
  await deleteAllRecords();
  userAndDevice1 = await createUserWithWorkspace({
    id: generateId(),
    username: username1,
  });
});

test("Existing workspace does nothing", async () => {
  const authorizationHeader = userAndDevice1.sessionKey;
  const workspaceId = userAndDevice1.workspace.id;
  const userAndDevice2 = await createUserWithWorkspace({
    id: generateId(),
    username: `${generateId()}@example.com`,
  });
  const workspaceInvitationResult = await createWorkspaceInvitation({
    graphql,
    role: Role.VIEWER,
    workspaceId,
    authorizationHeader,
  });
  const workspaceInvitationId =
    workspaceInvitationResult.createWorkspaceInvitation.workspaceInvitation.id;
  await acceptWorkspaceInvitation({
    graphql,
    workspaceInvitationId,
    inviteeUsername: userAndDevice2.user.username,
    inviteeMainDevice: userAndDevice2.mainDevice,
    invitationSigningPrivateKey:
      workspaceInvitationResult.invitationSigningPrivateKey,
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
  const decryptedWorkspaceKey = decryptWorkspaceKey({
    ciphertext: workspaceKeyBox.ciphertext,
    nonce: workspaceKeyBox.nonce,
    creatorDeviceEncryptionPublicKey: userAndDevice1.device.encryptionPublicKey,
    receiverDeviceEncryptionPrivateKey: userAndDevice1.encryptionPrivateKey,
  });
  const { nonce, ciphertext } = encryptWorkspaceKeyForDevice({
    workspaceKey: decryptedWorkspaceKey,
    receiverDeviceEncryptionPublicKey:
      userAndDevice2.device.encryptionPublicKey,
    creatorDeviceEncryptionPrivateKey: userAndDevice1.encryptionPrivateKey,
  });
  const workspaceMemberDevices: WorkspaceMemberDevices[] = [
    {
      id: workspaceId,
      workspaceKeysMembers: [
        {
          id: workspaceKey.id,
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
