import { gql } from "graphql-request";
import { v4 as uuidv4 } from "uuid";
import { Role } from "../../../../prisma/generated/output";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { createAndEncryptWorkspaceKeyForDevice } from "../../../../test/helpers/device/createAndEncryptWorkspaceKeyForDevice";
import { getWorkspaceKeyForWorkspaceAndDevice } from "../../../../test/helpers/device/getWorkspaceKeyForWorkspaceAndDevice";
import setupGraphql, {
  TestContext,
} from "../../../../test/helpers/setupGraphql";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";
import {
  createWorkspace,
  DeviceWorkspaceKeyBoxParams,
} from "../../../database/workspace/createWorkspace";
import { Workspace } from "../../../types/workspace";

const graphql = setupGraphql();
let user1Data: any = undefined;
const password = "password";
let user1WorkspaceKey = "";

const workspace1Id = uuidv4();
const workspace2Id = uuidv4();
const workspace1Name = "workspace 1";
const workspace2Name = "workspace 2";
let firstWorkspaceCursor = "";

const setup = async () => {
  user1Data = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
    password,
  });
  user1WorkspaceKey = await getWorkspaceKeyForWorkspaceAndDevice({
    device: user1Data.device,
    deviceEncryptionPrivateKey: user1Data.encryptionPrivateKey,
    workspace: user1Data.workspace,
  });
  const deviceWorkspaceKeyBoxes: DeviceWorkspaceKeyBoxParams[] = [];
  const workspaceKeyData1 = await createAndEncryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey: user1Data.device.encryptionPublicKey,
    creatorDeviceEncryptionPrivateKey: user1Data.encryptionPrivateKey,
  });
  deviceWorkspaceKeyBoxes.push({
    deviceSigningPublicKey: user1Data.device.signingPublicKey,
    nonce: workspaceKeyData1.nonce,
    ciphertext: workspaceKeyData1.ciphertext,
  });
  const workspaceKeyData2 = await createAndEncryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey: user1Data.webDevice.encryptionPublicKey,
    creatorDeviceEncryptionPrivateKey: user1Data.encryptionPrivateKey,
  });
  deviceWorkspaceKeyBoxes.push({
    deviceSigningPublicKey: user1Data.webDevice.signingPublicKey,
    nonce: workspaceKeyData2.nonce,
    ciphertext: workspaceKeyData2.ciphertext,
  });
  await createWorkspace({
    id: workspace2Id,
    name: workspace2Name,
    userId: user1Data.user.id,
    creatorDeviceSigningPublicKey: user1Data.device.signingPublicKey,
    deviceWorkspaceKeyBoxes,
  });
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
    deviceSigningPublicKey: user1Data.device.signingPublicKey,
    authorizationHeader: user1Data.sessionKey,
  });
  const workspaces = result.workspaces.nodes;
  expect(workspaces.length).toBe(2);
  firstWorkspaceCursor = result.workspaces.edges[0].cursor;
  workspaces.forEach((workspace: Workspace) => {
    expect(typeof workspace.id).toBe("string");
    expect(typeof workspace.name).toBe("string");
    if (workspace.id === user1Data.workspace.id) {
      expect(workspace.name).toBe(user1Data.workspace.name);
    } else {
      expect(workspace.name).toBe(workspace2Name);
    }
    expect(typeof workspace.currentWorkspaceKey?.id).toBe("string");
    expect(workspace.currentWorkspaceKey?.workspaceId).toBe(workspace.id);
    const workspaceKeyBox = workspace.currentWorkspaceKey?.workspaceKeyBox;
    expect(workspaceKeyBox?.deviceSigningPublicKey).toBe(
      user1Data.device.signingPublicKey
    );
    expect(workspaceKeyBox?.creatorDevice?.signingPublicKey).toBe(
      workspaceKeyBox?.creatorDeviceSigningPublicKey
    );
    expect(workspaceKeyBox?.creatorDevice?.signingPublicKey).toBe(
      user1Data.device.signingPublicKey
    );
    expect(typeof workspaceKeyBox?.ciphertext).toBe("string");
    expect(workspaceKeyBox?.workspaceKeyId).toBe(
      workspace.currentWorkspaceKey?.id
    );
    expect(workspace.members.length).toBe(1);
    const member = workspace.members[0];
    expect(member.userId).toBe(user1Data.user.id);
    expect(member.role).toBe(Role.ADMIN);
  });
});

test("user cannot query more than 50 results", async () => {
  await expect(async () => {
    await getWorkspaces({
      graphql,
      deviceSigningPublicKey: user1Data.device.signingPublicKey,
      first: 51,
      authorizationHeader: user1Data.sessionKey,
    });
  }).rejects.toThrowError(
    "Requested too many workspaces. First value exceeds 50."
  );
});

test("user can query by paginating cursor", async () => {
  const result = await getWorkspaces({
    graphql,
    deviceSigningPublicKey: user1Data.device.signingPublicKey,
    first: 1,
    after: firstWorkspaceCursor,
    authorizationHeader: user1Data.sessionKey,
  });
  const workspaces = result.workspaces.nodes;
  expect(workspaces.length).toBe(1);
  const workspace = workspaces[0];
  expect(workspace.id).toBe(workspace2Id);
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
      deviceSigningPublicKey: user1Data.device.signingPublicKey,
      first: 50,
      authorizationHeader: "badauthtoken",
    });
  }).rejects.toThrowError(/UNAUTHENTICATED/);
});

test("Input errors", async () => {
  const authorizationHeader = { authorization: user1Data.sessionKey };
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
