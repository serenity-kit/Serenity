import { createSnapshotKey } from "@serenity-tools/common";
import { v4 as uuidv4 } from "uuid";
import { Role } from "../../../../prisma/generated/output";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { createDocumentShareLink } from "../../../../test/helpers/document/createDocumentShareLink";
import { getDocumentShareLink } from "../../../../test/helpers/document/getDocumentShareLink";
import { deriveFolderKey } from "../../../../test/helpers/folder/deriveFolderKey";
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
  const folderKeyTrace = await deriveFolderKey({
    workspaceId: userData.workspace.id,
    folderId: userData.folder.id,
    keyDerivationTrace: userData.folder.keyDerivationTrace,
    activeDevice: userData.webDevice,
  });
  const snapshotKeyData = createSnapshotKey({
    folderKey: folderKeyTrace[folderKeyTrace.length - 1].key,
  });
  const createDocumentShareLinkResponse = await createDocumentShareLink({
    graphql,
    documentId: userData.document.id,
    sharingRole: Role.VIEWER,
    creatorDevice: userData.device,
    creatorDeviceEncryptionPrivateKey: userData.encryptionPrivateKey,
    snapshotKey: snapshotKeyData.key,
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
      }))()
  ).rejects.toThrowError(/FORBIDDEN/);
});
