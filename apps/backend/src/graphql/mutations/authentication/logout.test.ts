import { v4 as uuidv4 } from "uuid";
import { logout } from "../../../../test/helpers/authentication/logout";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { prisma } from "../../../database/prisma";
import { createDeviceAndLogin } from "../../../database/testHelpers/createDeviceAndLogin";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
let userData1: any;
let userData2: any;
let loginResult1: any;
let loginResult2: any;
let user1Device2: any = undefined;
let user1Device3: any = undefined;

const setup = async () => {
  userData1 = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
    password: "password",
  });
  loginResult1 = await createDeviceAndLogin({
    username: userData1.user.username,
    password: "password",
    envelope: userData1.envelope,
  });
  user1Device2 = loginResult1.webDevice;
  loginResult2 = await createDeviceAndLogin({
    username: userData1.user.username,
    password: "password",
    envelope: userData1.envelope,
  });
  user1Device3 = loginResult2.webDevice;
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("logout doesn't invalidate second session", async () => {
  const numSessionsBeforeLogout = await prisma.session.count({
    where: { userId: userData1.user.id },
  });
  const numDevicesBeforeLogout = await prisma.device.count({
    where: { userId: userData1.user.id },
  });
  const authorizationHeader = loginResult1.session.sessionKey;
  const logoutResponse = await logout({
    graphql,
    authorizationHeader,
  });
  expect(logoutResponse.logout.success).toBe(true);
  const numSessionsAfterLogout = await prisma.session.count({
    where: { userId: userData1.user.id },
  });
  const numDevicesAfterLogout = await prisma.device.count({
    where: { userId: userData1.user.id },
  });
  expect(numSessionsAfterLogout).toBe(numSessionsBeforeLogout - 1);
  expect(numDevicesAfterLogout).toBe(numDevicesBeforeLogout - 1);
  const remainingSession = await prisma.session.findFirst({
    where: {
      userId: userData1.user.id,
      sessionKey: loginResult2.session.sessionKey,
    },
  });
  expect(remainingSession?.sessionKey).toBe(loginResult2.sessionKey);
  const remainingDevice = await prisma.device.findFirst({
    where: {
      userId: userData1.user.id,
      signingPublicKey: loginResult2.webDevice.signingPublicKey,
    },
  });
  expect(remainingDevice?.signingPublicKey).toBe(
    loginResult2.webDevice.signingPublicKey
  );
});

test("logout", async () => {
  const numSessionsBeforeLogout = await prisma.session.count({
    where: { userId: userData1.user.id },
  });
  const numDevicesBeforeLogout = await prisma.device.count({
    where: { userId: userData1.user.id },
  });
  const authorizationHeader = loginResult2.sessionKey;
  const logoutResponse = await logout({
    graphql,
    authorizationHeader,
  });
  expect(logoutResponse.logout.success).toBe(true);
  const numSessionsAfterLogout = await prisma.session.count({
    where: { userId: userData1.user.id },
  });
  const numDevicesAfterLogout = await prisma.device.count({
    where: { userId: userData1.user.id },
  });
  expect(numSessionsAfterLogout).toBe(numSessionsBeforeLogout - 1);
  expect(numDevicesAfterLogout).toBe(numDevicesBeforeLogout - 1);
  const remainingSession = await prisma.session.findFirst({
    where: { userId: userData1.user.id, sessionKey: loginResult2.sessionKey },
  });
  expect(remainingSession).toBe(null);
  const remainingDevice = await prisma.device.findFirst({
    where: {
      userId: userData1.user.id,
      signingPublicKey: loginResult2.webDevice.signingPublicKey,
    },
  });
  expect(remainingDevice).toBe(null);
});

test("Unauthenticated", async () => {
  await expect(
    (async () =>
      await logout({
        graphql,
        authorizationHeader: loginResult1.sessionKey,
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});
