import { deriveSessionAuthorization, generateId } from "@serenity-tools/common";
import { gql } from "graphql-request";
import { registerUser } from "../../../../test/helpers/authentication/registerUser";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { initateFileUpload } from "../../../../test/helpers/file/initiateFileUpload";
import setupGraphql, {
  TestContext,
} from "../../../../test/helpers/setupGraphql";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
const password = "password22room5K42";
let userData: any = undefined;
let fileUploadData: any = undefined;

const setup = async () => {
  userData = await createUserWithWorkspace({
    username: `${generateId()}@example.com`,
    password,
  });
  const fileUploadResult = await initateFileUpload({
    graphql,
    documentId: userData.document.id,
    workspaceId: userData.workspace.id,
    authorization: deriveSessionAuthorization({
      sessionKey: userData.sessionKey,
    }).authorization,
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
  documentId: string;
  authorization: string;
};
const getFileUrl = async ({
  graphql,
  fileId,
  documentId,
  authorization,
}: Props) => {
  const query = gql`
    query fileUrl($fileId: ID!, $documentId: ID!) {
      fileUrl(fileId: $fileId, documentId: $documentId) {
        id
        downloadUrl
      }
    }
  `;
  return graphql.client.request<any>(
    query,
    { fileId, documentId },
    { authorization }
  );
};

test("get file url", async () => {
  const result = await getFileUrl({
    graphql,
    fileId: fileUploadData.fileId,
    documentId: userData.document.id,
    authorization: deriveSessionAuthorization({
      sessionKey: userData.sessionKey,
    }).authorization,
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
        authorization: deriveSessionAuthorization({
          sessionKey: otherUser.sessionKey,
        }).authorization,
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
      username: `${generateId()}@example.com`,
      password,
    });
    await expect(
      (async () =>
        await graphql.client.request<any>(
          query,
          {
            input: {
              fileId: null,
              documentId: userData.document.id,
            },
          },
          { authorization: userData.sessionKey }
        ))()
    ).rejects.toThrowError();
  });
  test("Invalid file id", async () => {
    const userData = await createUserWithWorkspace({
      username: `${generateId()}@example.com`,
      password,
    });
    await expect(
      (async () =>
        await graphql.client.request<any>(
          query,
          {
            input: {
              fileId: null,
              documentId: userData.document.id,
            },
          },
          { authorization: userData.sessionKey }
        ))()
    ).rejects.toThrowError();
  });
  test("Invalid input", async () => {
    const userData = await createUserWithWorkspace({
      username: `${generateId()}@example.com`,
      password,
    });
    await expect(
      (async () =>
        await graphql.client.request<any>(query, undefined, {
          authorization: userData.sessionKey,
        }))()
    ).rejects.toThrowError();
  });
});
