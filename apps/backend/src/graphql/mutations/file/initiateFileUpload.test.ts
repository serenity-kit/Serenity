import { gql } from "graphql-request";
import { v4 as uuidv4 } from "uuid";
import { Role } from "../../../../prisma/generated/output";
import { registerUser } from "../../../../test/helpers/authentication/registerUser";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import setupGraphql, {
  TestContext,
} from "../../../../test/helpers/setupGraphql";
import { prisma } from "../../../database/prisma";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
const password = "password";
let userData: any = undefined;

const setup = async () => {
  userData = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
    password,
  });
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

type Props = {
  graphql: TestContext;
  workspaceId: string;
  documentId: string;
  authorization: string;
};
const initateFileUpload = async ({
  graphql,
  documentId,
  workspaceId,
  authorization,
}: Props) => {
  const query = gql`
    mutation initiateFileUpload($input: InitiateFileUploadInput!) {
      initiateFileUpload(input: $input) {
        fileId
        uploadUrl
      }
    }
  `;
  return graphql.client.request(
    query,
    { input: { documentId, workspaceId } },
    { authorization }
  );
};

test("initiate file upload", async () => {
  const result = await initateFileUpload({
    graphql,
    documentId: userData.document.id,
    workspaceId: userData.workspace.id,
    authorization: userData.sessionKey,
  });
  const fileUpdoadData = result.initiateFileUpload;
  expect(typeof fileUpdoadData.fileId).toBe("string");
  expect(typeof fileUpdoadData.uploadUrl).toBe("string");
  expect(fileUpdoadData.uploadUrl).toContain("https://");
});

test("Invalid access", async () => {
  const otherUser = await registerUser(
    graphql,
    `${uuidv4()}@example.com`,
    "password"
  );
  await expect(
    (async () =>
      await initateFileUpload({
        graphql,
        documentId: userData.document.id,
        workspaceId: userData.workspace.id,
        authorization: otherUser.sessionKey,
      }))()
  ).rejects.toThrow("Unauthorized");
});

test("Commenter tries to upload", async () => {
  const otherUser = await registerUser(
    graphql,
    `${uuidv4()}@example.com`,
    "password"
  );
  await prisma.usersToWorkspaces.create({
    data: {
      userId: otherUser.userId,
      workspaceId: userData.workspace.id,
      role: Role.COMMENTER,
    },
  });
  await expect(
    (async () =>
      await initateFileUpload({
        graphql,
        documentId: userData.document.id,
        workspaceId: userData.workspace.id,
        authorization: otherUser.sessionKey,
      }))()
  ).rejects.toThrow("Unauthorized");
});

test("Viewer tries to upload", async () => {
  const otherUser = await registerUser(
    graphql,
    `${uuidv4()}@example.com`,
    "password"
  );
  await prisma.usersToWorkspaces.create({
    data: {
      userId: otherUser.userId,
      workspaceId: userData.workspace.id,
      role: Role.VIEWER,
    },
  });
  await expect(
    (async () =>
      await initateFileUpload({
        graphql,
        documentId: userData.document.id,
        workspaceId: userData.workspace.id,
        authorization: otherUser.sessionKey,
      }))()
  ).rejects.toThrow("Unauthorized");
});

test("Unauthenticated", async () => {
  await expect(
    (async () =>
      await initateFileUpload({
        graphql,
        documentId: userData.document.id,
        workspaceId: userData.workspace.id,
        authorization: "invalid-session-key",
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

describe("Input errors", () => {
  const query = gql`
    mutation initiateFileUpload($input: InitiateFileUploadInput!) {
      initiateFileUpload(input: $input) {
        fileId
        uploadUrl
      }
    }
  `;
  const id = uuidv4();
  test("Invalid document id", async () => {
    const userData = await createUserWithWorkspace({
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
              documentId: null,
              workspaceId: userData.workspace.id,
            },
          },
          { authorization: userData.sessionKey }
        ))()
    ).rejects.toThrowError();
  });
  test("Invalid document id", async () => {
    const userData = await createUserWithWorkspace({
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
              documentId: userData.document.id,
              workspaceId: null,
            },
          },
          { authorization: userData.sessionKey }
        ))()
    ).rejects.toThrowError();
  });
  test("Invalid input", async () => {
    const userData = await createUserWithWorkspace({
      id: uuidv4(),
      username: `${uuidv4()}@example.com`,
      password,
    });
    await expect(
      (async () =>
        await graphql.client.request(query, null, {
          authorization: userData.sessionKey,
        }))()
    ).rejects.toThrowError();
  });
});
