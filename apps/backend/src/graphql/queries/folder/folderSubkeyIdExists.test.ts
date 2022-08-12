import { kdfDeriveFromKey } from "@serenity-tools/common/src/kdfDeriveFromKey/kdfDeriveFromKey";
import { gql } from "graphql-request";
import { v4 as uuidv4 } from "uuid";
import { registerUser } from "../../../../test/helpers/authentication/registerUser";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { createWorkspaceKeyAndCipherTextForDevice } from "../../../../test/helpers/device/createWorkspaceKeyAndCipherTextForDevice";
import { getWorkspaceKeyForWorkspaceAndDevice } from "../../../../test/helpers/device/getWorkspaceKeyForWorkspaceAndDevice";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { createInitialWorkspaceStructure } from "../../../../test/helpers/workspace/createInitialWorkspaceStructure";
import { prisma } from "../../../database/prisma";

const graphql = setupGraphql();
const username = "7dfb4dd9-88be-414c-8a40-b5c030003d89@example.com";
const username2 = "4e9a4c29-2295-471c-84b5-5bf55169ff8c@example.com";
const password = "password";
let workspaceKey = "";

let registerUserResult: any = null;

const workspaceId = "4e9a4c29-2295-471c-84b5-5bf55169ff8c";
const parentFolderId = "4e9a4c29-2295-471c-84b5-5bf55169ff8c";
const folderId1 = "3530b9ed-11f3-44c7-9e16-7dba1e14815f";
const folderId2 = "9e911f29-7a86-480b-89d7-5c647f21317f";
const childFolderId = "98b3f4d9-141a-4e11-a0f5-7437a6d1eb4b";
const otherFolderId = "c1c65251-7471-4893-a1b5-e3df937caf66";
let sessionKey = "";

let folderSubkeyId = -1;

const setup = async () => {
  registerUserResult = await registerUser(graphql, username, password);
  sessionKey = registerUserResult.sessionKey;
  const device = registerUserResult.mainDevice;
  const initialWorkspaceStructureResult = await createInitialWorkspaceStructure(
    {
      workspaceName: "workspace 1",
      workspaceId: workspaceId,
      deviceSigningPublicKey: device.signingPublicKey,
      deviceEncryptionPublicKey: device.encryptionPublicKey,
      deviceEncryptionPrivateKey: registerUserResult.encryptionPrivateKey,
      folderId: uuidv4(),
      folderName: "Getting started",
      folderIdSignature: `TODO+${uuidv4()}`,
      documentId: uuidv4(),
      documentName: "Introduction",
      graphql,
      authorizationHeader: sessionKey,
    }
  );
  const workspace =
    initialWorkspaceStructureResult.createInitialWorkspaceStructure.workspace;
  workspaceKey = await getWorkspaceKeyForWorkspaceAndDevice({
    device: registerUserResult.mainDevice,
    deviceEncryptionPrivateKey: registerUserResult.encryptionPrivateKey,
    workspace,
  });
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

type FolderSubkeyExistProps = {
  authorizationHeader: string;
  subkeyId: number;
};
const folderSubkeyIdExists = async ({
  authorizationHeader,
  subkeyId,
}: FolderSubkeyExistProps) => {
  const authorizationHeaders = { authorization: authorizationHeader };
  const query = gql`
    query folderSubkeyIdExists($subkeyId: Int!) {
      folderSubkeyIdExists(subkeyId: $subkeyId) {
        folderSubkeyIdExists
      }
    }
  `;
  const result = await graphql.client.request(
    query,
    { subkeyId },
    authorizationHeaders
  );
  return result;
};

test("folder subkey doesn't already exist", async () => {
  const { workspaceKey } = await createWorkspaceKeyAndCipherTextForDevice({
    receiverDeviceEncryptionPublicKey:
      registerUserResult.mainDevice.encryptionPublicKey,
    creatorDeviceEncryptionPrivateKey: registerUserResult.encryptionPrivateKey,
  });
  const { subkeyId } = await kdfDeriveFromKey({
    key: workspaceKey,
    context: "folder__",
  });
  folderSubkeyId = subkeyId;
  // get root folders from graphql
  const result = await folderSubkeyIdExists({
    subkeyId,
    authorizationHeader: sessionKey,
  });
  expect(result.folderSubkeyIdExists).toMatchInlineSnapshot(`
    Object {
      "folderSubkeyIdExists": false,
    }
  `);
});

test("folder subkey already exist", async () => {
  const usersToWorkspace = await prisma.usersToWorkspaces.findFirst({
    where: { userId: registerUserResult.userId },
    select: { workspaceId: true },
  });
  if (!usersToWorkspace) {
    throw new Error("No usersToWorkspace found!");
  }
  const workspaceId = usersToWorkspace.workspaceId;
  const folder = await prisma.folder.findFirst({
    where: { workspace: { id: workspaceId } },
  });
  if (!folder) {
    throw new Error("No folders found!");
  }
  const result = await folderSubkeyIdExists({
    subkeyId: folder.subKeyId!,
    authorizationHeader: sessionKey,
  });
  expect(result.folderSubkeyIdExists).toMatchInlineSnapshot(`
    Object {
      "folderSubkeyIdExists": true,
    }
  `);
});

test("folder subkey already exist but for another user", async () => {
  const newUserResult = await registerUser(graphql, username2, password);
  const usersToWorkspace = await prisma.usersToWorkspaces.findFirst({
    where: { userId: registerUserResult.userId },
    select: { workspaceId: true },
  });
  if (!usersToWorkspace) {
    throw new Error("No usersToWorkspace found!");
  }
  const workspaceId = usersToWorkspace.workspaceId;
  const folder = await prisma.folder.findFirst({
    where: { workspace: { id: workspaceId } },
  });
  if (!folder) {
    throw new Error("No folders found!");
  }
  const result = await folderSubkeyIdExists({
    subkeyId: folder.subKeyId!,
    authorizationHeader: newUserResult.sessionKey,
  });
  expect(result.folderSubkeyIdExists).toMatchInlineSnapshot(`
    Object {
      "folderSubkeyIdExists": false,
    }
  `);
});

describe("Testing errors", () => {
  test("bad login", async () => {
    await expect(
      (async () =>
        await folderSubkeyIdExists({
          subkeyId: 1,
          authorizationHeader: "",
        }))()
    ).rejects.toThrow(/UNAUTHENTICATED/);
  });
  test("bad subKey", async () => {
    await expect(
      (async () =>
        await folderSubkeyIdExists({
          // @ts-ignore intentially sending bad type
          subkeyId: undefined,
          authorizationHeader: sessionKey,
        }))()
    ).rejects.toThrow(/BAD_USER_INPUT/);
  });
});
