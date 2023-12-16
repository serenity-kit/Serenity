import {
  deriveSessionAuthorization,
  encryptFolderName,
  folderDerivedKeyContext,
  generateId,
} from "@serenity-tools/common";
import {
  createSubkeyId,
  kdfDeriveFromKey,
} from "@serenity-tools/common/src/kdfDeriveFromKey/kdfDeriveFromKey";
import { gql } from "graphql-request";
import { Role } from "../../../../prisma/generated/output";
import { registerUser } from "../../../../test/helpers/authentication/registerUser";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { getWorkspaceKeyForWorkspaceAndDevice } from "../../../../test/helpers/device/getWorkspaceKeyForWorkspaceAndDevice";
import { createFolder } from "../../../../test/helpers/folder/createFolder";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { prisma } from "../../../database/prisma";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
let userData1: any = undefined;
const username = "user1";
const password = "password22room5K42";
let workspaceKey: string = "";
let addedWorkspace: any = null;
let sessionKey = "";

const setup = async () => {
  userData1 = await createUserWithWorkspace({
    username: `${generateId()}@example.com`,
    password,
  });
  sessionKey = userData1.sessionKey;
  addedWorkspace = userData1.workspace;
  workspaceKey = getWorkspaceKeyForWorkspaceAndDevice({
    device: userData1.device,
    deviceEncryptionPrivateKey: userData1.encryptionPrivateKey,
    workspace: userData1.workspace,
  });
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("user should be able to create a root folder", async () => {
  const authorizationHeader = deriveSessionAuthorization({
    sessionKey,
  }).authorization;
  const id = "c103a784-35cb-4aee-b366-d10398b6dd95";
  const parentFolderId = null;
  const name = "Untitled";

  const result = await createFolder({
    graphql,
    id,
    name,
    parentFolderId,
    parentKey: workspaceKey,
    workspaceId: userData1.workspace.id,
    workspaceKeyId: userData1.workspace.currentWorkspaceKey.id,
    authorizationHeader,
  });
  const folder = result.createFolder.folder;
  expect(folder.id).toBe(id);
  expect(typeof folder.nameCiphertext).toBe("string");
  expect(folder.parentFolderId).toBe(parentFolderId);
  expect(folder.workspaceId).toBe(addedWorkspace.id);
  expect(typeof folder.nameNonce).toBe("string");
  expect(folder.keyDerivationTrace.workspaceKeyId).toBe(
    userData1.workspace.currentWorkspaceKey.id
  );
  expect(folder.keyDerivationTrace.trace.length).toBe(1);
  expect(typeof folder.keyDerivationTrace.trace[0].subkeyId).toBe("string");
  expect(folder.keyDerivationTrace.trace[0].entryId).toBe(id);
  expect(folder.keyDerivationTrace.trace[0].parentId).toBe(null);
  expect(folder.keyDerivationTrace.trace[0].context).toBe(
    folderDerivedKeyContext
  );
});

test("user should be able to create a root folder with a name", async () => {
  const authorizationHeader = deriveSessionAuthorization({
    sessionKey,
  }).authorization;
  const id = "cb3e4195-40e2-45c0-8b87-8415abdc6b55";
  const parentFolderId = null;
  const name = "Named Folder";
  const result = await createFolder({
    graphql,
    id,
    name,
    parentFolderId,
    parentKey: workspaceKey,
    workspaceId: userData1.workspace.id,
    workspaceKeyId: userData1.workspace.currentWorkspaceKey.id,
    authorizationHeader,
  });
  const folder = result.createFolder.folder;
  expect(folder.id).toBe(id);
  expect(typeof folder.nameCiphertext).toBe("string");
  expect(folder.parentFolderId).toBe(parentFolderId);
  expect(folder.workspaceId).toBe(addedWorkspace.id);
  expect(typeof folder.nameNonce).toBe("string");
  expect(folder.keyDerivationTrace.workspaceKeyId).toBe(
    userData1.workspace.currentWorkspaceKey.id
  );
  expect(folder.keyDerivationTrace.trace.length).toBe(1);
  expect(typeof folder.keyDerivationTrace.trace[0].subkeyId).toBe("string");
  expect(folder.keyDerivationTrace.trace[0].entryId).toBe(id);
  expect(folder.keyDerivationTrace.trace[0].parentId).toBe(null);
  expect(folder.keyDerivationTrace.trace[0].context).toBe(
    folderDerivedKeyContext
  );
});

test("user should be able to create a child folder", async () => {
  const authorizationHeader = deriveSessionAuthorization({
    sessionKey,
  }).authorization;
  const id = "c3d28056-b619-41c4-be51-ce89ed5b8be4";
  const parentFolderId = "c103a784-35cb-4aee-b366-d10398b6dd95";
  const name = "Untitled";
  const parentFolder = await prisma.folder.findFirst({
    where: { id: parentFolderId },
  });
  const parentFolderKey = kdfDeriveFromKey({
    key: workspaceKey,
    context: folderDerivedKeyContext,
    subkeyId: parentFolder?.subkeyId,
  });
  const result = await createFolder({
    graphql,
    id,
    name,
    parentKey: parentFolderKey.key,
    parentFolderId,
    workspaceId: userData1.workspace.id,
    workspaceKeyId: userData1.workspace.currentWorkspaceKey.id,
    authorizationHeader,
  });
  const folder = result.createFolder.folder;
  expect(folder.id).toBe(id);
  expect(typeof folder.nameCiphertext).toBe("string");
  expect(folder.parentFolderId).toBe(parentFolderId);
  expect(folder.workspaceId).toBe(addedWorkspace.id);
  expect(typeof folder.nameNonce).toBe("string");
  expect(folder.keyDerivationTrace.workspaceKeyId).toBe(
    userData1.workspace.currentWorkspaceKey.id
  );
  expect(folder.keyDerivationTrace.trace.length).toBe(2);
  expect(typeof folder.keyDerivationTrace.trace[0].subkeyId).toBe("string");
  expect(folder.keyDerivationTrace.trace[0].entryId).toBe(parentFolderId);
  expect(folder.keyDerivationTrace.trace[0].parentId).toBe(null);
  expect(folder.keyDerivationTrace.trace[0].context).toBe(
    folderDerivedKeyContext
  );
  expect(typeof folder.keyDerivationTrace.trace[1].subkeyId).toBe("string");
  expect(folder.keyDerivationTrace.trace[1].entryId).toBe(id);
  expect(folder.keyDerivationTrace.trace[1].parentId).toBe(parentFolderId);
  expect(folder.keyDerivationTrace.trace[1].context).toBe(
    folderDerivedKeyContext
  );
});

test("duplicate ID throws an error", async () => {
  const authorizationHeader = deriveSessionAuthorization({
    sessionKey,
  }).authorization;
  const id = generateId();
  const parentFolderId = null;
  const name = "Untitled";
  await createFolder({
    graphql,
    id,
    name,
    parentKey: workspaceKey,
    parentFolderId,
    workspaceId: userData1.workspace.id,
    workspaceKeyId: userData1.workspace.currentWorkspaceKey.id,
    authorizationHeader,
  });
  await expect(
    (async () =>
      await createFolder({
        graphql,
        id,
        name,
        parentKey: workspaceKey,
        parentFolderId,
        workspaceId: userData1.workspace.id,
        workspaceKeyId: userData1.workspace.currentWorkspaceKey.id,
        authorizationHeader,
      }))()
  ).rejects.toThrow("Invalid input: duplicate id");
});

test("Throw error on duplicate subkeyId, workspaceId", async () => {
  const authorizationHeaders = {
    authorization: deriveSessionAuthorization({ sessionKey }).authorization,
  };
  const name = "subkey test";
  const workspaceId = userData1.workspace.id;
  const existingSubkeyId = userData1.folder.subkeyId;
  const encryptedFolderResult = encryptFolderName({
    name,
    parentKey: workspaceKey,
    subkeyId: existingSubkeyId,
    folderId: userData1.folder.id,
    workspaceId,
    keyDerivationTrace: {
      workspaceKeyId: userData1.workspace.currentWorkspaceKey.id,
      trace: [
        {
          entryId: userData1.folder.id,
          parentId: null,
          subkeyId: existingSubkeyId,
          context: folderDerivedKeyContext,
        },
      ],
    },
  });

  const nameCiphertext = encryptedFolderResult.ciphertext;
  const nameNonce = encryptedFolderResult.nonce;
  const query = gql`
    mutation createFolder($input: CreateFolderInput!) {
      createFolder(input: $input) {
        folder {
          id
          nameCiphertext
          nameNonce
          parentFolderId
          rootFolderId
          workspaceId
        }
      }
    }
  `;
  await expect(
    (async () =>
      await graphql.client.request<any>(
        query,
        {
          input: {
            id: "abc123",
            name,
            nameCiphertext,
            nameNonce,
            subkeyId: existingSubkeyId,
            parentFolderId: null,
            workspaceId: workspaceId,
          },
        },
        authorizationHeaders
      ))()
  ).rejects.toThrowError(/BAD_USER_INPUT/);
});

test("Throw error when the parent folder doesn't exist", async () => {
  const authorizationHeader = deriveSessionAuthorization({
    sessionKey,
  }).authorization;
  const id = "92d85bfd-0970-48e2-80b0-f100789e1350";
  const parentFolderId = "badthing";
  const name = "Untitled";
  await expect(
    (async () =>
      await createFolder({
        graphql,
        id,
        name,
        parentKey: workspaceKey,
        parentFolderId,
        workspaceId: addedWorkspace.id,
        workspaceKeyId: addedWorkspace.currentWorkspaceKey.id,
        authorizationHeader,
      }))()
  ).rejects.toThrowError(/FORBIDDEN/);
});

test("Throw error when user doesn't have access", async () => {
  const userData2 = await createUserWithWorkspace({
    username: `${generateId()}@example.com`,
    password,
  });
  const otherAddedWorkspace = userData2.workspace;
  const name = "Untitled";
  await expect(
    (async () =>
      await createFolder({
        graphql,
        id: "1d283506-9de4-426b-8a02-567f0645dc31",
        name,
        parentKey: workspaceKey,
        parentFolderId: null,
        workspaceId: otherAddedWorkspace.id,
        workspaceKeyId: addedWorkspace.currentWorkspaceKey.id,
        authorizationHeader: deriveSessionAuthorization({ sessionKey })
          .authorization,
      }))()
  ).rejects.toThrow("Unauthorized");
});

test("Commentor tries to create", async () => {
  const otherUser = await registerUser(
    graphql,
    `${generateId()}@example.com`,
    password
  );
  await prisma.usersToWorkspaces.create({
    data: {
      userId: otherUser.userId,
      workspaceId: addedWorkspace.id,
      role: Role.COMMENTER,
    },
  });
  const id = generateId();
  await expect(
    (async () =>
      await createFolder({
        graphql,
        id,
        name: "test",
        parentKey: workspaceKey,
        parentFolderId: null,
        workspaceId: addedWorkspace.id,
        workspaceKeyId: addedWorkspace.currentWorkspaceKey.id,
        authorizationHeader: deriveSessionAuthorization({
          sessionKey: otherUser.sessionKey,
        }).authorization,
      }))()
  ).rejects.toThrowError("Unauthorized");
});

test("Viewer tries to create", async () => {
  const otherUser = await registerUser(
    graphql,
    `${generateId()}@example.com`,
    password
  );
  await prisma.usersToWorkspaces.create({
    data: {
      userId: otherUser.userId,
      workspaceId: addedWorkspace.id,
      role: Role.VIEWER,
    },
  });
  const id = generateId();
  await expect(
    (async () =>
      await createFolder({
        graphql,
        id,
        name: "test",
        parentKey: workspaceKey,
        parentFolderId: null,
        workspaceId: addedWorkspace.id,
        workspaceKeyId: addedWorkspace.currentWorkspaceKey.id,
        authorizationHeader: deriveSessionAuthorization({
          sessionKey: otherUser.sessionKey,
        }).authorization,
      }))()
  ).rejects.toThrowError("Unauthorized");
});

test("Unauthenticated", async () => {
  const id = generateId();
  await expect(
    (async () =>
      await createFolder({
        graphql,
        id,
        name: "test",
        parentKey: workspaceKey,
        parentFolderId: null,
        workspaceId: addedWorkspace.id,
        workspaceKeyId: addedWorkspace.currentWorkspaceKey.id,
        authorizationHeader: "badauthheader",
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

describe("Input errors", () => {
  const authorizationHeaders = {
    authorization: deriveSessionAuthorization({ sessionKey }).authorization,
  };
  const query = gql`
    mutation createFolder($input: CreateFolderInput!) {
      createFolder(input: $input) {
        folder {
          id
          nameCiphertext
          nameNonce
          parentFolderId
          rootFolderId
          workspaceId
        }
      }
    }
  `;
  test("Invalid id", async () => {
    const name = "test";
    const subkeyId = createSubkeyId();
    const encryptedFolderResult = encryptFolderName({
      name,
      parentKey: workspaceKey,
      subkeyId,
      folderId: userData1.folder.id,
      workspaceId: addedWorkspace.id,
      keyDerivationTrace: {
        workspaceKeyId: userData1.workspace.currentWorkspaceKey.id,
        trace: [
          {
            entryId: userData1.folder.id,
            parentId: null,
            subkeyId,
            context: folderDerivedKeyContext,
          },
        ],
      },
    });
    const nameCiphertext = encryptedFolderResult.ciphertext;
    const nameNonce = encryptedFolderResult.nonce;
    await expect(
      (async () =>
        await graphql.client.request<any>(
          query,
          {
            input: {
              id: null,
              name,
              nameCiphertext,
              nameNonce,
              subkeyId,
              parentFolderId: null,
              workspaceId: addedWorkspace.id,
            },
          },
          authorizationHeaders
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("Invalid workspaceId", async () => {
    const name = "test";
    const subkeyId = createSubkeyId();
    const encryptedFolderResult = encryptFolderName({
      name,
      parentKey: workspaceKey,
      subkeyId,
      folderId: userData1.folder.id,
      workspaceId: addedWorkspace.id,
      keyDerivationTrace: {
        workspaceKeyId: userData1.workspace.currentWorkspaceKey.id,
        trace: [
          {
            entryId: userData1.folder.id,
            parentId: null,
            subkeyId,
            context: folderDerivedKeyContext,
          },
        ],
      },
    });
    const nameCiphertext = encryptedFolderResult.ciphertext;
    const nameNonce = encryptedFolderResult.nonce;
    await expect(
      (async () =>
        await graphql.client.request<any>(
          query,
          {
            input: {
              id: "abc123",
              name,
              nameCiphertext,
              nameNonce,
              subkeyId,
              parentFolderId: null,
              workspaceId: null,
            },
          },
          authorizationHeaders
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("Invalid input", async () => {
    await expect(
      (async () =>
        await graphql.client.request<any>(
          query,
          {
            input: null,
          },
          authorizationHeaders
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("No input", async () => {
    await expect(
      (async () =>
        await graphql.client.request<any>(
          query,
          undefined,
          authorizationHeaders
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
});
