import { v4 as uuidv4 } from "uuid";
import { Role } from "../../../../prisma/generated/output";
import { createComment } from "../../../../test/helpers/comment/createComment";
import { deleteComments } from "../../../../test/helpers/comment/deleteComments";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { acceptWorkspaceInvitation } from "../../../../test/helpers/workspace/acceptWorkspaceInvitation";
import { createWorkspaceInvitation } from "../../../../test/helpers/workspace/createWorkspaceInvitation";
import { prisma } from "../../../database/prisma";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
let userData1: any;
let userData2: any;

const setup = async () => {
  userData1 = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
    password: "password",
  });
  userData2 = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
    password: "password",
  });
  // share a workspace between users
  const workspaceInvitationResult = await createWorkspaceInvitation({
    graphql,
    workspaceId: userData1.workspace.id,
    authorizationHeader: userData1.sessionKey,
  });
  const workspaceInvitation =
    workspaceInvitationResult.createWorkspaceInvitation.workspaceInvitation;
  const invitationSigningPrivateKey =
    workspaceInvitationResult.invitationSigningPrivateKey;
  await acceptWorkspaceInvitation({
    graphql,
    workspaceInvitationId: workspaceInvitation.id,
    invitationSigningPrivateKey,
    inviteeUsername: userData2.user.username,
    inviteeMainDevice: userData2.mainDevice,
    authorizationHeader: userData2.sessionKey,
  });
  await prisma.usersToWorkspaces.updateMany({
    where: {
      workspaceId: userData1.workspace.id,
      userId: userData2.user.id,
    },
    data: {
      role: Role.COMMENTER,
    },
  });
  // encrypt workspaceKeys for user2
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("commenter deletes own comment", async () => {
  const commentResult = await createComment({
    graphql,
    documentId: userData1.document.id,
    comment: "comment 1",
    creatorDevice: userData1.webDevice,
    creatorDeviceSigningPrivateKey: userData1.webDevice.signingPrivateKey,
    creatorDeviceEncryptionPrivateKey: userData1.webDevice.encryptionPrivateKey,
    authorizationHeader: userData1.sessionKey,
  });
  const commentsBeforeDelete = await prisma.comment.findMany({
    where: { documentId: userData1.document.id },
  });
  expect(commentsBeforeDelete.length).toBe(1);
  const deleteCommentsResult = await deleteComments({
    graphql,
    commentIds: [commentResult.createComment.id],
    authorizationHeader: userData1.sessionKey,
  });
  expect(deleteCommentsResult.deleteComments.status).toBe("success");
  const commentsAfterDelete = await prisma.comment.findMany({
    where: { documentId: userData1.document.id },
  });
  expect(commentsAfterDelete.length).toBe(0);
});

test("admin deletes comment", async () => {
  const commentResult = await createComment({
    graphql,
    documentId: userData1.document.id,
    comment: "comment 1",
    creatorDevice: userData2.webDevice,
    creatorDeviceSigningPrivateKey: userData2.webDevice.signingPrivateKey,
    creatorDeviceEncryptionPrivateKey: userData2.webDevice.encryptionPrivateKey,
    authorizationHeader: userData2.sessionKey,
  });
  console.log(commentResult);
  const commentsBeforeDelete = await prisma.comment.findMany({
    where: { documentId: userData1.document.id },
  });
  console.log({ commentsBeforeDelete });
  expect(commentsBeforeDelete.length).toBe(1);
  const deleteCommentsResult = await deleteComments({
    graphql,
    commentIds: [commentResult.createComment.id],
    authorizationHeader: userData1.sessionKey,
  });
  expect(deleteCommentsResult.deleteComments.status).toBe("success");
  const commentsAfterDelete = await prisma.comment.findMany({
    where: { documentId: userData1.document.id },
  });
  expect(commentsAfterDelete.length).toBe(0);
});

test.skip("editor deletes comment", async () => {
  await prisma.usersToWorkspaces.updateMany({
    where: {
      workspaceId: userData1.workspace.id,
      userId: userData1.user.id,
    },
    data: {
      role: Role.EDITOR,
    },
  });
  const commentResult = await createComment({
    graphql,
    documentId: userData2.document.id,
    comment: "comment 1",
    creatorDevice: userData2.webDevice,
    creatorDeviceSigningPrivateKey: userData2.webDevice.signingPrivateKey,
    creatorDeviceEncryptionPrivateKey: userData2.webDevice.encryptionPrivateKey,
    authorizationHeader: userData2.sessionKey,
  });
  const commentsBeforeDelete = await prisma.comment.findMany({
    where: { documentId: userData1.document.id },
  });
  expect(commentsBeforeDelete.length).toBe(1);
  const deleteCommentsResult = await deleteComments({
    graphql,
    commentIds: [commentResult.createComment.id],
    authorizationHeader: userData1.sessionKey,
  });
  expect(deleteCommentsResult.deleteComments.status).toBe("success");
  const commentsAfterDelete = await prisma.comment.findMany({
    where: { documentId: userData1.document.id },
  });
  expect(commentsAfterDelete.length).toBe(0);
});

// test("delete a device", async () => {
//   const authorizationHeader = userData1.sessionKey;
//   const numDevicesAfterCreate = await getDevices({
//     graphql,
//     hasNonExpiredSession: true,
//     authorizationHeader,
//   });
//   expect(numDevicesAfterCreate.devices.edges.length).toBe(3);

//   // // connected session must exist
//   // const session = await prisma.session.findFirst({
//   //   where: {
//   //     deviceSigningPublicKey: userData1.webDevice.signingPublicKey,
//   //   },
//   // });
//   // expect(session).not.toBeNull();
//   const workspaceKeyBox1 = encryptWorkspaceKeyForDevice({
//     receiverDeviceEncryptionPublicKey: userData1.device.encryptionPublicKey,
//     creatorDeviceEncryptionPrivateKey: userData1.encryptionPrivateKey,
//     workspaceKey,
//   });
//   const workspaceKeyBox2 = encryptWorkspaceKeyForDevice({
//     receiverDeviceEncryptionPublicKey: userData1.webDevice.encryptionPublicKey,
//     creatorDeviceEncryptionPrivateKey: userData1.encryptionPrivateKey,
//     workspaceKey,
//   });
//   const newDeviceWorkspaceKeyBoxes: WorkspaceWithWorkspaceDevicesParing[] = [
//     {
//       id: userData1.workspace.id,
//       workspaceDevices: [
//         {
//           receiverDeviceSigningPublicKey: userData1.device.signingPublicKey,
//           ciphertext: workspaceKeyBox1.ciphertext,
//           nonce: workspaceKeyBox1.nonce,
//         },
//         {
//           receiverDeviceSigningPublicKey: userData1.webDevice.signingPublicKey,
//           ciphertext: workspaceKeyBox2.ciphertext,
//           nonce: workspaceKeyBox2.nonce,
//         },
//       ],
//     },
//   ];
//   // device should exist
//   const response = await deleteDevices({
//     graphql,
//     creatorSigningPublicKey: userData1.device.signingPublicKey,
//     newDeviceWorkspaceKeyBoxes,
//     deviceSigningPublicKeysToBeDeleted: [user1Device2.signingPublicKey],
//     authorizationHeader,
//   });
//   expect(response.deleteDevices.status).toBe("success");

//   // check if device still exists
//   const numDevicesAfterDelete = await getDevices({
//     graphql,
//     hasNonExpiredSession: true,
//     authorizationHeader,
//   });
//   expect(numDevicesAfterDelete.devices.edges.length).toBe(2);

//   // connected session must have been deleted
//   // const deletedSession = await prisma.session.findFirst({
//   //   where: {
//   //     deviceSigningPublicKey: userData1.webDevice.signingPublicKey,
//   //   },
//   // });
//   // expect(deletedSession).toBeNull();

//   // device should not exist
//   await expect(
//     (async () =>
//       await getDeviceBySigningPublicKey({
//         graphql,
//         signingPublicKey: user1Device2.signingPublicKey,
//         authorizationHeader,
//       }))()
//   ).rejects.toThrowError(/FORBIDDEN/);
// });

// test("won't delete a device they don't own", async () => {
//   const authorizationHeader1 = userData1.sessionKey;
//   const numDevicesBeforeDeleteResponse = await getDevices({
//     graphql,
//     hasNonExpiredSession: true,
//     authorizationHeader: authorizationHeader1,
//   });
//   const expectedNumDevices =
//     numDevicesBeforeDeleteResponse.devices.edges.length;

//   const workspaceKeyBox1 = encryptWorkspaceKeyForDevice({
//     receiverDeviceEncryptionPublicKey: userData1.device.encryptionPublicKey,
//     creatorDeviceEncryptionPrivateKey: userData1.encryptionPrivateKey,
//     workspaceKey,
//   });
//   const workspaceKeyBox2 = encryptWorkspaceKeyForDevice({
//     receiverDeviceEncryptionPublicKey: userData1.webDevice.encryptionPublicKey,
//     creatorDeviceEncryptionPrivateKey: userData1.encryptionPrivateKey,
//     workspaceKey,
//   });
//   const workspaceKeyBox3 = encryptWorkspaceKeyForDevice({
//     receiverDeviceEncryptionPublicKey: userData2.device.encryptionPublicKey,
//     creatorDeviceEncryptionPrivateKey: userData1.encryptionPrivateKey,
//     workspaceKey,
//   });
//   const newDeviceWorkspaceKeyBoxes: WorkspaceWithWorkspaceDevicesParing[] = [
//     {
//       id: userData1.workspace.id,
//       workspaceDevices: [
//         {
//           receiverDeviceSigningPublicKey: userData1.device.signingPublicKey,
//           ciphertext: workspaceKeyBox1.ciphertext,
//           nonce: workspaceKeyBox1.nonce,
//         },
//         {
//           receiverDeviceSigningPublicKey: userData1.webDevice.signingPublicKey,
//           ciphertext: workspaceKeyBox2.ciphertext,
//           nonce: workspaceKeyBox2.nonce,
//         },
//         {
//           receiverDeviceSigningPublicKey: userData2.device.signingPublicKey,
//           ciphertext: workspaceKeyBox3.ciphertext,
//           nonce: workspaceKeyBox3.nonce,
//         },
//       ],
//     },
//   ];
//   // device should exist
//   const response = await deleteDevices({
//     graphql,
//     creatorSigningPublicKey: userData1.device.signingPublicKey,
//     newDeviceWorkspaceKeyBoxes,
//     deviceSigningPublicKeysToBeDeleted: [],
//     authorizationHeader: authorizationHeader1,
//   });
//   expect(response.deleteDevices.status).toBe("success");

//   // check if device still exists
//   const numDevicesAfterDelete = await getDevices({
//     graphql,
//     hasNonExpiredSession: true,
//     authorizationHeader: authorizationHeader1,
//   });
//   expect(numDevicesAfterDelete.devices.edges.length).toBe(expectedNumDevices);
// });

// test("delete login device clears session", async () => {
//   const authorizationHeader = userData1.sessionKey;
//   const numDevicesAfterCreate = await getDevices({
//     graphql,
//     hasNonExpiredSession: true,
//     authorizationHeader,
//   });
//   expect(numDevicesAfterCreate.devices.edges.length).toBe(2);

//   // connected session must exist
//   const session = await prisma.session.findFirst({
//     where: {
//       deviceSigningPublicKey: userData1.webDevice.signingPublicKey,
//     },
//   });
//   expect(session).not.toBeNull();
//   const workspaceKeyBox1 = encryptWorkspaceKeyForDevice({
//     receiverDeviceEncryptionPublicKey: userData1.device.encryptionPublicKey,
//     creatorDeviceEncryptionPrivateKey: userData1.encryptionPrivateKey,
//     workspaceKey,
//   });
//   const newDeviceWorkspaceKeyBoxes: WorkspaceWithWorkspaceDevicesParing[] = [
//     {
//       id: userData1.workspace.id,
//       workspaceDevices: [
//         {
//           receiverDeviceSigningPublicKey: userData1.device.signingPublicKey,
//           ciphertext: workspaceKeyBox1.ciphertext,
//           nonce: workspaceKeyBox1.nonce,
//         },
//       ],
//     },
//   ];
//   // device should exist
//   const response = await deleteDevices({
//     graphql,
//     creatorSigningPublicKey: userData1.device.signingPublicKey,
//     newDeviceWorkspaceKeyBoxes,
//     deviceSigningPublicKeysToBeDeleted: [userData1.webDevice.signingPublicKey],
//     authorizationHeader,
//   });
//   expect(response.deleteDevices.status).toBe("success");

//   // // check if device still exists
//   const numDevicesAfterDelete = await prisma.device.count({
//     where: { userId: userData1.user.id },
//   });
//   expect(numDevicesAfterDelete).toBe(1);

//   // connected session must have been deleted
//   const deletedSession = await prisma.session.findFirst({
//     where: {
//       deviceSigningPublicKey: userData1.webDevice.signingPublicKey,
//     },
//   });
//   expect(deletedSession).toBeNull();

//   // device should not exist
//   await expect(
//     (async () =>
//       await getDeviceBySigningPublicKey({
//         graphql,
//         signingPublicKey: user1Device2.signingPublicKey,
//         authorizationHeader,
//       }))()
//   ).rejects.toThrowError(/Not authenticated/);
// });

// test("Unauthenticated", async () => {
//   await expect(
//     (async () =>
//       await deleteDevices({
//         graphql,
//         creatorSigningPublicKey: userData1.device.signingPublicKey,
//         newDeviceWorkspaceKeyBoxes: [],
//         deviceSigningPublicKeysToBeDeleted: [],
//         authorizationHeader: "badauthheader",
//       }))()
//   ).rejects.toThrowError(/UNAUTHENTICATED/);
// });

// describe("Input errors", () => {
//   const authorizationHeaders = {
//     authorization: "somesessionkey",
//   };
//   const query = gql`
//     mutation deleteDevices($input: DeleteDevicesInput!) {
//       deleteDevices(input: $input) {
//         status
//       }
//     }
//   `;
//   test("Invalid creatorSigningPublicKey", async () => {
//     await expect(
//       (async () =>
//         await graphql.client.request(
//           query,
//           {
//             input: {
//               creatorDeviceSigningPublicKey: null,
//               newDeviceWorkspaceKeyBoxes: [],
//             },
//           },
//           authorizationHeaders
//         ))()
//     ).rejects.toThrowError(/BAD_USER_INPUT/);
//   });
//   test("No mainDevice", async () => {
//     await expect(
//       (async () =>
//         await graphql.client.request(
//           query,
//           {
//             input: {
//               creatorDeviceSigningPublicKey: userData1.device.signingPublicKey,
//               newDeviceWorkspaceKeyBoxes: [],
//             },
//           },
//           authorizationHeaders
//         ))()
//     ).rejects.toThrowError(/BAD_USER_INPUT/);
//   });
//   test("Invalid input", async () => {
//     await expect(
//       (async () =>
//         await graphql.client.request(
//           query,
//           {
//             input: null,
//           },
//           authorizationHeaders
//         ))()
//     ).rejects.toThrowError(/BAD_USER_INPUT/);
//   });
//   test("No input", async () => {
//     await expect(
//       (async () =>
//         await graphql.client.request(query, null, authorizationHeaders))()
//     ).rejects.toThrowError(/BAD_USER_INPUT/);
//   });
// });
