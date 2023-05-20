import { generateId } from "@serenity-tools/common";
import { gql } from "graphql-request";
import { registerUser } from "../../../../test/helpers/authentication/registerUser";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { initateFileUpload } from "../../../../test/helpers/file/initiateFileUpload";
import setupGraphql, {
  TestContext,
} from "../../../../test/helpers/setupGraphql";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
const password = "password";
let userData: any = undefined;
let fileUploadData: any = undefined;

const setup = async () => {
  userData = await createUserWithWorkspace({
    id: generateId(),
    username: `${generateId()}@example.com`,
    password,
  });
  const fileUploadResult = await initateFileUpload({
    graphql,
    documentId: userData.document.id,
    workspaceId: userData.workspace.id,
    authorization: userData.sessionKey,
  });
  fileUploadData = fileUploadResult.initiateFileUpload;
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

type Props = {
  graphql: TestContext;
  fileId: string;
  workspaceId: string;
  documentId: string;
  authorization: string;
};
const getFileUrl = async ({
  graphql,
  fileId,
  documentId,
  workspaceId,
  authorization,
}: Props) => {
  const query = gql`
    query fileUrl($fileId: ID!, $documentId: ID!, $workspaceId: ID!) {
      fileUrl(
        fileId: $fileId
        documentId: $documentId
        workspaceId: $workspaceId
      ) {
        id
        downloadUrl
      }
    }
  `;
  return graphql.client.request(
    query,
    { fileId, documentId, workspaceId },
    { authorization }
  );
};

test("get file url", async () => {
  const result = await getFileUrl({
    graphql,
    fileId: fileUploadData.fileId,
    documentId: userData.document.id,
    workspaceId: userData.workspace.id,
    authorization: userData.sessionKey,
  });
  const fileUrl = result.fileUrl;
  expect(typeof fileUrl.id).toBe("string");
  expect(typeof fileUrl.downloadUrl).toBe("string");
  expect(fileUrl.downloadUrl).toContain("https://");
});

test("invalid access", async () => {
  const otherUser = await registerUser(
    graphql,
    `${generateId()}@example.com`,
    "password"
  );
  await expect(
    (async () =>
      await getFileUrl({
        graphql,
        fileId: fileUploadData.fileId,
        documentId: userData.document.id,
        workspaceId: userData.workspace.id,
        authorization: otherUser.sessionKey,
      }))()
  ).rejects.toThrow("Unauthorized");
});

test("Unauthenticated", async () => {
  await expect(
    (async () =>
      await getFileUrl({
        graphql,
        fileId: fileUploadData.fileId,
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
  const id = generateId();
  test("Invalid file id", async () => {
    const userData = await createUserWithWorkspace({
      id: generateId(),
      username: `${generateId()}@example.com`,
      password,
    });
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: {
              fileId: null,
              documentId: userData.document.id,
              workspaceId: userData.workspace.id,
            },
          },
          { authorization: userData.sessionKey }
        ))()
    ).rejects.toThrowError();
  });
  test("Invalid document id", async () => {
    const userData = await createUserWithWorkspace({
      id: generateId(),
      username: `${generateId()}@example.com`,
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
      id: generateId(),
      username: `${generateId()}@example.com`,
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
