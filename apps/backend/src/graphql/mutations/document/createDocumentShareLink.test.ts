import sodium from "@serenity-tools/libsodium";
import { gql } from "graphql-request";
import { v4 as uuidv4 } from "uuid";
import { Role } from "../../../../prisma/generated/output";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { createDocumentShareLink } from "../../../../test/helpers/document/createDocumentShareLink";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
const password = "password";
let userData1: any = null;

const setup = async () => {
  await sodium.ready;
  userData1 = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
    password,
  });
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("create share link", async () => {
  const { encryptionPrivateKey, signingPrivateKey, ...creatorDevice } =
    userData1.webDevice;
  const snapshotKey = await sodium.crypto_kdf_keygen();
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
  const token = documentShareLinkResponse.createDocumentShareLink.token;
  expect(typeof token).toBe("string");
});

test("Invalid ownership", async () => {
  const otherUser = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
    password,
  });
  const { encryptionPrivateKey, signingPrivateKey, ...creatorDevice } =
    otherUser.webDevice;
  const documentId = userData1.document.id;
  const authorizationHeader = otherUser.sessionKey;
  const snapshotKey = await sodium.crypto_kdf_keygen();
  await expect(
    (async () =>
      await createDocumentShareLink({
        graphql,
        documentId,
        sharingRole: Role.EDITOR,
        deviceSecretBoxCiphertext: "deviceSecretBoxCiphertext",
        deviceSecretBoxNonce: "deviceSecretBoxNonce",
        creatorDevice,
        creatorDeviceEncryptionPrivateKey: encryptionPrivateKey,
        receiverDevices: [creatorDevice],
        snapshotKey,
        authorizationHeader,
      }))()
  ).rejects.toThrowError("Unauthorized");
});

test("Unauthenticated", async () => {
  const { encryptionPrivateKey, signingPrivateKey, ...creatorDevice } =
    userData1.webDevice;
  const snapshotKey = await sodium.crypto_kdf_keygen();
  await expect(
    (async () =>
      await createDocumentShareLink({
        graphql,
        documentId: userData1.document.id,
        sharingRole: Role.EDITOR,
        deviceSecretBoxCiphertext: "deviceSecretBoxCiphertext",
        deviceSecretBoxNonce: "deviceSecretBoxNonce",
        creatorDevice,
        creatorDeviceEncryptionPrivateKey: encryptionPrivateKey,
        receiverDevices: [creatorDevice],
        snapshotKey,
        authorizationHeader: "badauthheader",
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
    const snapshotKey = await sodium.crypto_kdf_keygen();
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: {
              graphql,
              documentId: null,
              sharingRole: Role.EDITOR,
              deviceSecretBoxCiphertext: "deviceSecretBoxCiphertext",
              deviceSecretBoxNonce: "deviceSecretBoxNonce",
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
  test("Invalid sharing role", async () => {
    const userData1 = await createUserWithWorkspace({
      id: uuidv4(),
      username: `${uuidv4()}@example.com`,
      password,
    });
    const { encryptionPrivateKey, signingPrivateKey, ...creatorDevice } =
      userData1.webDevice;
    const snapshotKey = await sodium.crypto_kdf_keygen();
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: {
              graphql,
              documentId: userData1.document.id,
              sharingRole: null,
              deviceSecretBoxCiphertext: "deviceSecretBoxCiphertext",
              deviceSecretBoxNonce: "deviceSecretBoxNonce",
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
    const snapshotKey = await sodium.crypto_kdf_keygen();
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: {
              graphql,
              documentId: userData1.document.id,
              sharingRole: Role.VIEWER,
              deviceSecretBoxCiphertext: "deviceSecretBoxCiphertext",
              deviceSecretBoxNonce: "deviceSecretBoxNonce",
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
