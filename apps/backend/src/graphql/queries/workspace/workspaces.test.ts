import { gql } from "graphql-request";
import { Role } from "../../../../prisma/generated/output";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import setupGraphql, {
  TestContext,
} from "../../../../test/helpers/setupGraphql";
import { createInitialWorkspaceStructure } from "../../../../test/helpers/workspace/createInitialWorkspaceStructure";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";
import { Workspace } from "../../../types/workspace";

const graphql = setupGraphql();
let userData1: any = undefined;
let otherWorkspace: any = undefined;
let sessionKey = "";
const username = "user";
const password = "password";
let device: any;
let webDevice: any;

// const workspace1Id = generateId();
// const workspace2Id = generateId();
// const workspace1Name = "workspace 1";
const workspace2Name = "workspace 2";
let firstWorkspaceCursor = "";

const setup = async () => {
  userData1 = await createUserWithWorkspace({
    username,
    password,
  });
  sessionKey = userData1.sessionKey;
  device = userData1.device;
  webDevice = userData1.webDevice;
  const createInitialWorkspaceStructureResult =
    await createInitialWorkspaceStructure({
      graphql,
      workspaceName: workspace2Name,
      creatorDevice: {
        ...userData1.device,
        encryptionPrivateKey: userData1.encryptionPrivateKey,
        signingPrivateKey: userData1.signingPrivateKey,
      },
      mainDevice: userData1.mainDevice,
      devices: [userData1.device, userData1.webDevice],
      authorizationHeader: sessionKey,
    });
  otherWorkspace =
    createInitialWorkspaceStructureResult.createInitialWorkspaceStructure;
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

type GetWorkspacesProps = {
  graphql: TestContext;
  deviceSigningPublicKey: string;
  first: number;
  after?: string;
  authorizationHeader: string;
};
const getWorkspaces = async ({
  graphql,
  deviceSigningPublicKey,
  first,
  after,
  authorizationHeader,
}: GetWorkspacesProps) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const query = gql`
    query workspaces(
      $first: Int!
      $after: String
      $deviceSigningPublicKey: String!
    ) {
      workspaces(
        first: $first
        after: $after
        deviceSigningPublicKey: $deviceSigningPublicKey
      ) {
        nodes {
          id
          name
          members {
            userId
            role
          }
          currentWorkspaceKey {
            id
            workspaceId
            workspaceKeyBox {
              id
              workspaceKeyId
              deviceSigningPublicKey
              creatorDeviceSigningPublicKey
              ciphertext
              creatorDevice {
                signingPublicKey
                encryptionPublicKey
              }
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
      deviceSigningPublicKey,
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
    deviceSigningPublicKey: device.signingPublicKey,
    authorizationHeader: userData1.sessionKey,
  });
  const workspaces = result.workspaces.nodes;
  expect(workspaces.length).toBe(2);
  firstWorkspaceCursor = result.workspaces.edges[0].cursor;
  workspaces.forEach((workspace: Workspace) => {
    expect(typeof workspace.id).toBe("string");
    expect(typeof workspace.name).toBe("string");
    if (workspace.id === userData1.workspace.id) {
      expect(workspace.name).toBe(userData1.workspace.name);
    } else {
      expect(workspace.name).toBe(workspace2Name);
    }
    expect(typeof workspace.currentWorkspaceKey?.id).toBe("string");
    expect(workspace.currentWorkspaceKey?.workspaceId).toBe(workspace.id);
    const workspaceKeyBox = workspace.currentWorkspaceKey?.workspaceKeyBox;
    expect(workspaceKeyBox?.deviceSigningPublicKey).toBe(
      device.signingPublicKey
    );
    expect(workspaceKeyBox?.creatorDevice?.signingPublicKey).toBe(
      workspaceKeyBox?.creatorDeviceSigningPublicKey
    );
    expect(workspaceKeyBox?.creatorDevice?.signingPublicKey).toBe(
      device.signingPublicKey
    );
    expect(typeof workspaceKeyBox?.ciphertext).toBe("string");
    expect(workspaceKeyBox?.workspaceKeyId).toBe(
      workspace.currentWorkspaceKey?.id
    );
    expect(workspace.members.length).toBe(1);
    const member = workspace.members[0];
    expect(member.userId).toBe(userData1.user.id);
    expect(member.role).toBe(Role.ADMIN);
  });
});

test("user cannot query more than 50 results", async () => {
  await expect(async () => {
    await getWorkspaces({
      graphql,
      deviceSigningPublicKey: device.signingPublicKey,
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
    deviceSigningPublicKey: device.signingPublicKey,
    first: 1,
    after: firstWorkspaceCursor,
    authorizationHeader: sessionKey,
  });
  const workspaces = result.workspaces.nodes;
  expect(workspaces.length).toBe(1);
  const workspace = workspaces[0];
  expect(workspace.id).toBe(otherWorkspace.workspace.id);
  expect(workspace.name).toBe(workspace2Name);
});

// NOTE: removing this feature until we update the front-end UI
// to only retrieve workspaces after login and device registration
// test("User should not be able to retrieve workspaces for another device", async () => {
//   await expect(async () => {
//     await getWorkspaces({
//       graphql,
//       deviceSigningPublicKey: "abcde",
//       first: 50,
//       authorizationHeader: sessionKey,
//     });
//   }).rejects.toThrowError(/Internal server error/);
// });

test("Unauthenticated", async () => {
  await expect(async () => {
    await getWorkspaces({
      graphql,
      deviceSigningPublicKey: device.signingPublicKey,
      first: 50,
      authorizationHeader: "badauthtoken",
    });
  }).rejects.toThrowError(/UNAUTHENTICATED/);
});

test("Input errors", async () => {
  const authorizationHeader = { authorization: sessionKey };
  const query = gql`
    {
      workspaces(first: 51) {
        nodes {
          id
          name
          members {
            userId
            role
          }
        }
        edges {
          cursor
        }
      }
    }
  `;
  await expect(
    (async () =>
      await graphql.client.request(query, null, authorizationHeader))()
  ).rejects.toThrowError();
});
