import { generateId } from "@serenity-tools/common";
import sodium from "react-native-libsodium";
import { Role } from "../../../../prisma/generated/output";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { createDocumentShareLink } from "../../../../test/helpers/document/createDocumentShareLink";
import { removeDocumentShareLink } from "../../../../test/helpers/document/removeDocumentShareLink";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
const password = "password22room5K42";
let userData1: any = null;
let snapshotKey = "";
let shareLinkDeviceSigningPublicKey = "";

const setup = async () => {
  await sodium.ready;
  userData1 = await createUserWithWorkspace({
    username: `${generateId()}@example.com`,
    password,
  });
  snapshotKey = sodium.to_base64(sodium.crypto_kdf_keygen());
  const { signingPublicKey } = await createDocumentShareLink({
    graphql,
    documentId: userData1.document.id,
    sharingRole: Role.EDITOR,
    mainDevice: userData1.mainDevice,
    snapshotKey,
    authorizationHeader: userData1.sessionKey,
  });
  shareLinkDeviceSigningPublicKey = signingPublicKey;
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("Invalid document ownership", async () => {
  const otherUser = await createUserWithWorkspace({
    username: `${generateId()}@example.com`,
    password,
  });
  await expect(
    (async () =>
      await removeDocumentShareLink({
        graphql,
        deviceSigningPublicKey: shareLinkDeviceSigningPublicKey,
        mainDevice: otherUser.mainDevice,
        authorizationHeader: otherUser.sessionKey,
        documentId: userData1.document.id,
      }))()
  ).rejects.toThrowError("Unauthorized");
});

test("Not the main device", async () => {
  await expect(
    (async () =>
      await removeDocumentShareLink({
        graphql,
        deviceSigningPublicKey: shareLinkDeviceSigningPublicKey,
        mainDevice: userData1.webDevice,
        authorizationHeader: userData1.sessionKey,
        documentId: userData1.document.id,
      }))()
  ).rejects.toThrowError("Not the user's main device");
});

test("remove share link", async () => {
  const response = await removeDocumentShareLink({
    graphql,
    deviceSigningPublicKey: shareLinkDeviceSigningPublicKey,
    mainDevice: userData1.mainDevice,
    authorizationHeader: userData1.sessionKey,
    documentId: userData1.document.id,
  });
  expect(response).toMatchInlineSnapshot(`
    {
      "removeDocumentShareLink": {
        "success": true,
      },
    }
  `);
});

test("Unauthenticated", async () => {
  await expect(
    (async () =>
      await removeDocumentShareLink({
        graphql,
        deviceSigningPublicKey: shareLinkDeviceSigningPublicKey,
        documentId: userData1.document.id,
        mainDevice: userData1.mainDevice,
        authorizationHeader: "badsessionkey",
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});
