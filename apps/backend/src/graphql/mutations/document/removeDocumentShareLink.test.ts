import sodium from "@serenity-tools/libsodium";
import { gql } from "graphql-request";
import { v4 as uuidv4 } from "uuid";
import { Role } from "../../../../prisma/generated/output";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { createDocumentShareLink } from "../../../../test/helpers/document/createDocumentShareLink";
import { removeDocumentShareLink } from "../../../../test/helpers/document/removeDocumentShareLink";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

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
  snapshotKey = sodium.crypto_kdf_keygen();
  const documentShareLinkResponse = await createDocumentShareLink({
    graphql,
    documentId: userData1.document.id,
    sharingRole: Role.EDITOR,
    creatorDevice,
    creatorDeviceEncryptionPrivateKey: encryptionPrivateKey,
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
    otherUser.webDevice;
  const receiverDevices = [creatorDevice, otherUser.webDevice];
  await expect(
    (async () =>
      await removeDocumentShareLink({
        graphql,
        token: documentShareLinkToken,
        authorizationHeader: otherUser.sessionKey,
      }))()
  ).rejects.toThrowError("Unauthorized");
});

test("remove share link", async () => {
  const { encryptionPrivateKey, signingPrivateKey, ...creatorDevice } =
    userData1.webDevice;
  const response = await removeDocumentShareLink({
    graphql,
    token: documentShareLinkToken,
    authorizationHeader: userData1.sessionKey,
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
  const { encryptionPrivateKey, signingPrivateKey, ...creatorDevice } =
    userData1.webDevice;
  await expect(
    (async () =>
      await removeDocumentShareLink({
        graphql,
        token: documentShareLinkToken,
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
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: {
              graphql,
              token: null,
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
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: {
              graphql,
              token: documentShareLinkToken,
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
