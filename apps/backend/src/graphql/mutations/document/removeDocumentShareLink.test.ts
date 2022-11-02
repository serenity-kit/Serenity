import sodium from "@serenity-tools/libsodium";
import { gql } from "graphql-request";
import { v4 as uuidv4 } from "uuid";
import { Role } from "../../../../prisma/generated/output";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { createDocumentShareLink } from "../../../../test/helpers/document/createDocumentShareLink";
import { removeDocumentShareLink } from "../../../../test/helpers/document/removeDocumentShareLink";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";
import { Device } from "../../../types/device";

const graphql = setupGraphql();
const password = "password";
let userData1: any = null;
let snapshotKey = "";
let documentShareLinkToken = "";

const setup = async () => {
  await sodium.ready;
  userData1 = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
    password,
  });
  const { encryptionPrivateKey, signingPrivateKey, ...creatorDevice } =
    userData1.webDevice;
  snapshotKey = await sodium.crypto_kdf_keygen();
  const documentShareLinkResponse = await createDocumentShareLink({
    graphql,
    documentId: userData1.document.id,
    sharingRole: Role.EDITOR,
    deviceSecretBoxCiphertext: "deviceSecretBoxCiphertext",
    deviceSecretBoxNonce: "deviceSecretBoxNonce",
    creatorDevice,
    creatorDeviceEncryptionPrivateKey: encryptionPrivateKey,
    receiverDevices: [creatorDevice],
    snapshotKey,
    authorizationHeader: userData1.sessionKey,
  });
  documentShareLinkToken =
    documentShareLinkResponse.createDocumentShareLink.token;
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("Invalid document ownership", async () => {
  const otherUser = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
    password,
  });
  const { encryptionPrivateKey, signingPrivateKey, ...creatorDevice } =
    userData1.webDevice;
  const receiverDevices = [
    creatorDevice as Device,
    otherUser.webDevice as Device,
  ];
  await expect(
    (async () =>
      await removeDocumentShareLink({
        graphql,
        token: documentShareLinkToken,
        creatorDevice,
        creatorDeviceEncryptionPrivateKey: encryptionPrivateKey,
        snapshotKey,
        receiverDevices,
        authorizationHeader: otherUser.sessionKey,
      }))()
  ).rejects.toThrowError("Unauthorized");
});

test.only("remove share link", async () => {
  const { encryptionPrivateKey, signingPrivateKey, ...creatorDevice } =
    userData1.webDevice;
  const receiverDevices = [creatorDevice];
  const response = await removeDocumentShareLink({
    graphql,
    token: documentShareLinkToken,
    creatorDevice,
    creatorDeviceEncryptionPrivateKey: encryptionPrivateKey,
    snapshotKey,
    receiverDevices,
    authorizationHeader: userData1.sessionKey,
  });
  expect(response).toMatchInlineSnapshot();
});

test("Unauthenticated", async () => {
  const { encryptionPrivateKey, signingPrivateKey, ...creatorDevice } =
    userData1.webDevice;
  const receiverDevices = [creatorDevice];
  await expect(
    (async () =>
      await removeDocumentShareLink({
        graphql,
        token: documentShareLinkToken,
        creatorDevice,
        creatorDeviceEncryptionPrivateKey: encryptionPrivateKey,
        snapshotKey,
        receiverDevices,
        authorizationHeader: "badsessionkey",
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

describe("Input errors", () => {
  const query = gql`
    mutation createDocumentShareLink($input: CreateDocumentShareLinkInput!) {
      createDocumentShareLink(input: $input) {
        token
      }
    }
  `;
  test("Invalid documentId", async () => {
    const userData1 = await createUserWithWorkspace({
      id: uuidv4(),
      username: `${uuidv4()}@example.com`,
      password,
    });
    const { encryptionPrivateKey, signingPrivateKey, ...creatorDevice } =
      userData1.webDevice;
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: {
              graphql,
              token: null,
              creatorDevice,
              creatorDeviceEncryptionPrivateKey: encryptionPrivateKey,
              receiverDevices: [creatorDevice],
              snapshotKey,
            },
          },
          { authorization: userData1.sessionKey }
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("Invalid creator device", async () => {
    const userData1 = await createUserWithWorkspace({
      id: uuidv4(),
      username: `${uuidv4()}@example.com`,
      password,
    });
    const otherUser = await createUserWithWorkspace({
      id: uuidv4(),
      username: `${uuidv4()}@example.com`,
      password,
    });
    const { encryptionPrivateKey, signingPrivateKey, ...creatorDevice } =
      otherUser.webDevice;
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: {
              graphql,
              token: documentShareLinkToken,
              creatorDevice,
              creatorDeviceEncryptionPrivateKey: encryptionPrivateKey,
              receiverDevices: [creatorDevice],
              snapshotKey,
            },
          },
          { authorization: userData1.sessionKey }
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("Invalid input", async () => {
    const userData1 = await createUserWithWorkspace({
      id: uuidv4(),
      username: `${uuidv4()}@example.com`,
      password,
    });
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: null,
          },
          { authorization: userData1.sessionKey }
        ))()
    ).rejects.toThrowError();
  });
  test("No input", async () => {
    const userData1 = await createUserWithWorkspace({
      id: uuidv4(),
      username: `${uuidv4()}@example.com`,
      password,
    });
    await expect(
      (async () =>
        await graphql.client.request(query, null, {
          authorization: userData1.sessionKey,
        }))()
    ).rejects.toThrowError();
  });
});
