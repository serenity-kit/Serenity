import { gql } from "graphql-request";
import setupGraphql, {
  TestContext,
} from "../../../../test/helpers/setupGraphql";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { registerUser } from "../../../../test/helpers/authentication/registerUser";
import { createInitialWorkspaceStructure } from "../../../../test/helpers/workspace/createInitialWorkspaceStructure";
import { v4 as uuidv4 } from "uuid";
import { Workspace } from "../../../types/workspace";

const graphql = setupGraphql();
let userId = "";
let sessionKey = "";
const username = "user";
const password = "password";
let device: any;

const workspace1Id = uuidv4();
const workspace2Id = uuidv4();
const workspace1Name = "workspace 1";
const workspace2Name = "workspace 2";
let firstWorkspaceCursor = "";

const setup = async () => {
  const registerUserResult = await registerUser(graphql, username, password);
  userId = registerUserResult.userId;
  sessionKey = registerUserResult.sessionKey;
  device = registerUserResult.mainDevice;
  await createInitialWorkspaceStructure({
    workspaceName: workspace1Name,
    workspaceId: workspace1Id,
    deviceSigningPublicKey: registerUserResult.mainDevice.signingPublicKey,
    deviceEncryptionPublicKey: registerUserResult.encryptionPrivateKey,
    folderId: uuidv4(),
    folderIdSignature: `TODO+${uuidv4()}`,
    folderName: "Getting started",
    documentName: "Introduction",
    documentId: uuidv4(),
    graphql,
    authorizationHeader: sessionKey,
  });
  await createInitialWorkspaceStructure({
    workspaceName: workspace2Name,
    workspaceId: workspace2Id,
    deviceSigningPublicKey: registerUserResult.mainDevice.signingPublicKey,
    deviceEncryptionPublicKey: registerUserResult.encryptionPrivateKey,
    folderId: uuidv4(),
    folderIdSignature: `TODO+${uuidv4()}`,
    folderName: "Getting started",
    documentName: "Introduction",
    documentId: uuidv4(),
    graphql,
    authorizationHeader: sessionKey,
  });
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

type GetWorkspacesProps = {
  graphql: TestContext;
  first: number;
  after?: string;
  authorizationHeader: string;
};
const getWorkspaces = async ({
  graphql,
  first,
  after,
  authorizationHeader,
}: GetWorkspacesProps) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const query = gql`
    query workspaces($first: Int!, $after: String) {
      workspaces(first: $first, after: $after) {
        nodes {
          id
          name
          members {
            userId
            isAdmin
          }
          currentWorkspaceKey {
            id
            workspaceId
            workspaceKeyBoxes {
              id
              workspaceKeyId
              deviceSigningPublicKey
              nonce
              ciphertext
            }
          }
        }
        edges {
          cursor
        }
      }
    }
  `;
  return graphql.client.request(
    query,
    {
      first,
      after,
    },
    authorizationHeaders
  );
};

test("user should be able to list workspaces", async () => {
  const result = await getWorkspaces({
    graphql,
    first: 50,
    authorizationHeader: sessionKey,
  });
  const workspaces = result.workspaces.nodes;
  expect(workspaces.length).toBe(2);
  firstWorkspaceCursor = result.workspaces.edges[0].cursor;
  workspaces.forEach((workspace: Workspace) => {
    expect(typeof workspace.id).toBe("string");
    expect(typeof workspace.name).toBe("string");
    if (workspace.id === workspace1Id) {
      expect(workspace.name).toBe(workspace1Name);
    } else {
      expect(workspace.name).toBe(workspace2Name);
    }
    expect(typeof workspace.currentWorkspaceKey?.id).toBe("string");
    expect(workspace.currentWorkspaceKey?.workspaceId).toBe(workspace.id);
    expect(workspace.currentWorkspaceKey?.workspaceKeyBoxes.length).toBe(1);
    const workspaceKeyBox = workspace.currentWorkspaceKey?.workspaceKeyBoxes[0];
    expect(workspaceKeyBox?.deviceSigningPublicKey).toBe(
      device.signingPublicKey
    );
    expect(typeof workspaceKeyBox?.nonce).toBe("string");
    expect(typeof workspaceKeyBox?.ciphertext).toBe("string");
    expect(workspaceKeyBox?.workspaceKeyId).toBe(
      workspace.currentWorkspaceKey?.id
    );
    expect(workspace.members.length).toBe(1);
    const member = workspace.members[0];
    expect(member.userId).toBe(userId);
    expect(member.isAdmin).toBe(true);
  });
});

test("user cannot query more than 50 results", async () => {
  await expect(async () => {
    await getWorkspaces({
      graphql,
      first: 51,
      authorizationHeader: sessionKey,
    });
  }).rejects.toThrowError(
    "Requested too many workspaces. First value exceeds 50."
  );
});

test("user can query by paginating cursor", async () => {
  const result = await getWorkspaces({
    graphql,
    first: 1,
    after: firstWorkspaceCursor,
    authorizationHeader: sessionKey,
  });
  const workspaces = result.workspaces.nodes;
  expect(workspaces.length).toBe(1);
  const workspace = workspaces[0];
  expect(workspace.id).toBe(workspace2Id);
  expect(workspace.name).toBe(workspace2Name);
});

test("Unauthenticated", async () => {
  await expect(async () => {
    await getWorkspaces({
      graphql,
      first: 50,
      authorizationHeader: "badauthtoken",
    });
  }).rejects.toThrowError(/UNAUTHENTICATED/);
});
