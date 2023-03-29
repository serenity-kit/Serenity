import { generateId } from "@naisho/core";
import canonicalize from "canonicalize";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import {
  query as updatedWorkspaceInfoQuery,
  updateWorkspaceInfo,
} from "../../../../test/helpers/workspace/updateWorkspaceInfo";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
let userData1: any = null;
let userData2: any = null;
const password1 = generateId();
const password2 = generateId();

beforeAll(async () => {
  await deleteAllRecords();
  userData1 = await createUserWithWorkspace({
    id: generateId(),
    username: `${generateId()}@example.com`,
    password: password1,
  });
  userData2 = await createUserWithWorkspace({
    id: generateId(),
    username: `${generateId()}@example.com`,
    password: password2,
  });
});

test("update info", async () => {
  const info = canonicalize({
    name: "test",
    id: "abc",
  });
  const devices = [userData1.mainDevice, userData1.webDevice];
  const updateWorkspaceInfoResult = await updateWorkspaceInfo({
    graphql,
    workspaceId: userData1.workspace.id,
    info: info!,
    creatorDevice: {
      ...userData1.mainDevice,
      encryptionPrivateKey: userData1.mainDevice.encryptionPrivateKey,
      signingPrivateKey: userData1.mainDevice.signingPrivateKey,
    },
    devices,
    authorizationHeader: userData1.sessionKey,
  });
  const updatedWorkspace =
    updateWorkspaceInfoResult.updateWorkspaceInfo.workspace;
  expect(updatedWorkspace.infoCiphertext).not.toBeNull();
  expect(updatedWorkspace.infoNonce).not.toBeNull();
  expect(updatedWorkspace.infoWorkspaceKeyId).not.toBeNull();
  const infoWorkspaceKey = updatedWorkspace.infoWorkspaceKey;
  expect(infoWorkspaceKey.workspaceKeyBox).not.toBeNull();
  expect(typeof infoWorkspaceKey.workspaceKeyBox.ciphertext).toBe("string");
  expect(typeof infoWorkspaceKey.workspaceKeyBox.nonce).toBe("string");
  expect(infoWorkspaceKey.workspaceKeyBox.deviceSigningPublicKey).toBe(
    userData1.webDevice.signingPublicKey
  );
  expect(infoWorkspaceKey.workspaceKeyBox.creatorDeviceSigningPublicKey).toBe(
    userData1.mainDevice.signingPublicKey
  );
  expect(infoWorkspaceKey.generation).toBe(0);
});

test("main device not included", async () => {
  const info = canonicalize({
    name: "test",
    id: "abc",
  });
  const devices = [userData1.webDevice];
  await expect(
    (async () => {
      await updateWorkspaceInfo({
        graphql,
        workspaceId: userData1.workspace.id,
        info: info!,
        creatorDevice: {
          ...userData1.mainDevice,
          encryptionPrivateKey: userData1.mainDevice.encryptionPrivateKey,
          signingPrivateKey: userData1.mainDevice.signingPrivateKey,
        },
        devices,
        authorizationHeader: userData1.sessionKey,
      });
    })()
  ).rejects.toThrow(/BAD_USER_INPUT/);
});

test("session device not included", async () => {
  const info = canonicalize({
    name: "test",
    id: "abc",
  });
  const devices = [userData1.mainDevice];
  await expect(
    (async () => {
      await updateWorkspaceInfo({
        graphql,
        workspaceId: userData1.workspace.id,
        info: info!,
        creatorDevice: {
          ...userData1.mainDevice,
          encryptionPrivateKey: userData1.mainDevice.encryptionPrivateKey,
          signingPrivateKey: userData1.mainDevice.signingPrivateKey,
        },
        devices,
        authorizationHeader: userData1.sessionKey,
      });
    })()
  ).rejects.toThrow(/BAD_USER_INPUT/);
});

test("unauthorized user", async () => {
  const info = canonicalize({
    name: "test",
    id: "abc",
  });
  const devices = [userData1.mainDevice, userData1.webDevice];
  await expect(
    (async () => {
      await updateWorkspaceInfo({
        graphql,
        workspaceId: userData1.workspace.id,
        info: info!,
        creatorDevice: {
          ...userData2.mainDevice,
          encryptionPrivateKey: userData2.mainDevice.encryptionPrivateKey,
          signingPrivateKey: userData2.mainDevice.signingPrivateKey,
        },
        devices,
        authorizationHeader: userData2.sessionKey,
      });
    })()
  ).rejects.toThrow(/FORBIDDEN/);
});

describe("Input errors", () => {
  test("update bad workspaceId", async () => {
    await expect(
      (async () => {
        await graphql.client.request(
          updatedWorkspaceInfoQuery,
          {
            input: {
              workspaceId: null,
              infoCiphertext: "",
              infoNonce: "",
              creatorDeviceSigningPublicKey:
                userData1.mainDevice.signingPublicKey,
              infoWorkspaceKeyBoxes: [],
            },
          },
          { authorization: userData1.sessionKey }
        );
      })()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("update bad ciphertext", async () => {
    await expect(
      (async () => {
        await graphql.client.request(
          updatedWorkspaceInfoQuery,
          {
            input: {
              workspaceId: userData1.workspace.id,
              infoCiphertext: null,
              infoNonce: "",
              creatorDeviceSigningPublicKey:
                userData1.mainDevice.signingPublicKey,
              infoWorkspaceKeyBoxes: [],
            },
          },
          { authorization: userData1.sessionKey }
        );
      })()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("update bad nonce", async () => {
    await expect(
      (async () => {
        await graphql.client.request(
          updatedWorkspaceInfoQuery,
          {
            input: {
              workspaceId: userData1.workspace.id,
              infoCiphertext: "",
              infoNonce: null,
              creatorDeviceSigningPublicKey:
                userData1.mainDevice.signingPublicKey,
              infoWorkspaceKeyBoxes: [],
            },
          },
          { authorization: userData1.sessionKey }
        );
      })()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("update bad creatorSigningPublicKey", async () => {
    await expect(
      (async () => {
        await graphql.client.request(
          updatedWorkspaceInfoQuery,
          {
            input: {
              workspaceId: userData1.workspace.id,
              infoCiphertext: "",
              infoNonce: "",
              creatorDeviceSigningPublicKey: null,
              infoWorkspaceKeyBoxes: [],
            },
          },
          { authorization: userData1.sessionKey }
        );
      })()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("update bad keyBoxes", async () => {
    await expect(
      (async () => {
        await graphql.client.request(
          updatedWorkspaceInfoQuery,
          {
            input: {
              workspaceId: userData1.workspace.id,
              infoCiphertext: "",
              infoNonce: "",
              creatorDeviceSigningPublicKey:
                userData1.mainDevice.signingPublicKey,
              infoWorkspaceKeyBoxes: null,
            },
          },
          { authorization: userData1.sessionKey }
        );
      })()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("update bad keyBoxes", async () => {
    await expect(
      (async () => {
        await graphql.client.request(
          updatedWorkspaceInfoQuery,
          {
            input: null,
          },
          { authorization: userData1.sessionKey }
        );
      })()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
});
