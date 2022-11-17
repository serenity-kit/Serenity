import sodium from "@serenity-tools/libsodium";
import { v4 as uuidv4 } from "uuid";
import { Role } from "../../../../prisma/generated/output";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { createDocumentShareLink } from "../../../../test/helpers/document/createDocumentShareLink";
import { getDocumentShareLink } from "../../../../test/helpers/document/getDocumentShareLink";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
let userData: any = undefined;
let token = "";

const setup = async () => {
  userData = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
  });

  // TODO: derive snapshotkey from folder key derivation trace
  const snapshotKey = await sodium.crypto_kdf_keygen();
  const createDocumentShareLinkResponse = await createDocumentShareLink({
    graphql,
    documentId: userData.document.id,
    sharingRole: Role.VIEWER,
    creatorDevice: userData.device,
    creatorDeviceEncryptionPrivateKey: userData.encryptionPrivateKey,
    snapshotKey,
    authorizationHeader: userData.sessionKey,
  });
  token = createDocumentShareLinkResponse.createDocumentShareLink.token;
};
beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("get a documentShareLink", async () => {
  const documentShareLinkResult = await getDocumentShareLink({
    graphql,
    token,
    authorizationHeader: userData.sessionKey,
  });
  const documentShareLink = documentShareLinkResult.documentShareLink;
  expect(documentShareLink.token).toBe(token);
  expect(typeof documentShareLink.deviceSecretBoxCiphertext).toBe("string");
  expect(typeof documentShareLink.deviceSecretBoxNonce).toBe("string");
});

test("invalid token", async () => {
  await expect(
    (async () =>
      await getDocumentShareLink({
        graphql,
        token: "invalid",
        authorizationHeader: userData.sessionKey,
      }))()
  ).rejects.toThrowError(/BAD_USER_INPUT/);
});

test("Unauthorized", async () => {
  const userData2 = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
  });
  await expect(
    (async () =>
      await getDocumentShareLink({
        graphql,
        token,
        authorizationHeader: userData2.sessionKey,
      }))()
  ).rejects.toThrowError("Unauthorized");
});

test("Unauthenticated", async () => {
  await expect(
    (async () =>
      await getDocumentShareLink({
        graphql,
        token: "abc123",
        authorizationHeader: "bad-session-key",
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});
