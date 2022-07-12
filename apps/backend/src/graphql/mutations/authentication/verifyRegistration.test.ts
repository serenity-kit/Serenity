import setupGraphql from "../../../../test/helpers/setupGraphql";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { v4 as uuidv4 } from "uuid";
import { registerUnverifiedUser } from "../../../../test/helpers/authentication/registerUnverifiedUser";
import { prisma } from "../../../database/prisma";
import { verifyUser } from "../../../../test/helpers/authentication/verifyUser";

const graphql = setupGraphql();

beforeAll(async () => {
  await deleteAllRecords();
});

test("server should verify a user", async () => {
  const username = "user1";
  const password = "password";
  const pendingWorkspaceInvitationId = undefined;
  const registrationResponse = await registerUnverifiedUser({
    graphql,
    username,
    password,
    pendingWorkspaceInvitationId,
  });
  const verificationCode =
    registrationResponse.finishRegistration.verificationCode;
  const verifyRegistrationResponse = await verifyUser({
    graphql,
    username,
    verificationCode,
  });
  expect(typeof verifyRegistrationResponse.verifyRegistration.id).toBe(
    "string"
  );
  const verifiedUserId = verifyRegistrationResponse.verifyRegistration.id;
  const verifiedUser = await prisma.user.findUnique({
    where: { id: verifiedUserId },
  });
  expect(verifiedUser?.username).toBe(username);
  expect(verifiedUser?.pendingWorkspaceInvitationId).toBe(null);
});

test("server should verify a user with a pending workspace id", async () => {
  const username = "user2";
  const password = "password";
  const pendingWorkspaceInvitationId = uuidv4();
  const registrationResponse = await registerUnverifiedUser({
    graphql,
    username,
    password,
    pendingWorkspaceInvitationId,
  });
  const verificationCode =
    registrationResponse.finishRegistration.verificationCode;
  const verifyRegistrationResponse = await verifyUser({
    graphql,
    username,
    verificationCode,
  });
  expect(typeof verifyRegistrationResponse.verifyRegistration.id).toBe(
    "string"
  );
  const verifiedUserId = verifyRegistrationResponse.verifyRegistration.id;
  const verifiedUser = await prisma.user.findUnique({
    where: { id: verifiedUserId },
  });
  expect(verifiedUser?.username).toBe(username);
  expect(verifiedUser?.pendingWorkspaceInvitationId).toBe(
    pendingWorkspaceInvitationId
  );
});
