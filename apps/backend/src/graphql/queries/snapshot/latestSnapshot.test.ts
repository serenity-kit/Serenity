import { gql } from "graphql-request";
import { v4 as uuidv4 } from "uuid";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { getLatestSnapshot } from "../../../../test/helpers/snapshot/getLatestSnapshot";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
const password = "password";
let userData1: any = undefined;

const setup = async () => {
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

test("retrieve snapshot", async () => {
  const snapshotResult = await getLatestSnapshot({
    graphql,
    documentId: userData1.document.id,
    authorizationHeader: userData1.sessionKey,
  });
  const snapshot = snapshotResult.latestSnapshot.snapshot;
  expect(snapshot).not.toBe(null);
  expect(snapshot.documentId).toBe(userData1.document.id);
  expect(snapshot.latestVersion).toBe(0);
  expect(snapshot.keyDerivationTrace.workspaceKeyId).toBe(
    userData1.workspace.currentWorkspaceKey.id
  );
  // FIXME: parentFolders should be [{ folderId: userData1.folderId, parentFolderId: null, subKeyId: userData1.folder.subkeyId }]
  expect(snapshot.keyDerivationTrace.parentFolders.length).toBe(0);
  expect(snapshot.preview).toBe("");
  expect(snapshot.data).not.toBe(null);
});

test("invalid document", async () => {
  await expect(
    (async () =>
      await getLatestSnapshot({
        graphql,
        documentId: "invalidDocumentId",
        authorizationHeader: userData1.sessionKey,
      }))()
  ).rejects.toThrowError(/BAD_USER_INPUT/);
});

test("invalid user", async () => {
  const userData2 = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
    password,
  });
  await expect(
    (async () =>
      await getLatestSnapshot({
        graphql,
        documentId: userData1.document.id,
        authorizationHeader: userData2.sessionKey,
      }))()
  ).rejects.toThrowError(/Unauthorized/);
});

describe("errors", () => {
  const query = gql`
    query latestSnapshot($documentId: ID!) {
      latestSnapshot(documentId: $documentId) {
        snapshot {
          id
        }
      }
    }
  `;
  test("Unauthenticated", async () => {
    const userData1 = await createUserWithWorkspace({
      id: uuidv4(),
      username: `${uuidv4()}@example.com`,
      password,
    });

    const authorizationHeader = { authorization: "badauthheader" };
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          { documentId: userData1.document.id },
          authorizationHeader
        ))()
    ).rejects.toThrowError(/UNAUTHENTICATED/);
  });
});
