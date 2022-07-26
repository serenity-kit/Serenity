import setupGraphql from "../../../../test/helpers/setupGraphql";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { v4 as uuidv4 } from "uuid";
import { registerUnverifiedUser } from "../../../../test/helpers/authentication/registerUnverifiedUser";
import { prisma } from "../../../database/prisma";
import { verifyUser } from "../../../../test/helpers/authentication/verifyUser";
import { gql } from "graphql-request";

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

describe("Input errors", () => {
  const verifyRegistrationQuery = gql`
    mutation verifyRegistration($input: VerifyRegistrationInput!) {
      verifyRegistration(input: $input) {
        id
      }
    }
  `;
  test("Invalid username", async () => {
    await expect(
      (async () =>
        await graphql.client.request(verifyRegistrationQuery, {
          input: {
            username: null,
            verificationCode: "1234",
          },
        }))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("Invalid verificationCode", async () => {
    await expect(
      (async () =>
        await graphql.client.request(verifyRegistrationQuery, {
          input: {
            username: "user@example.com",
            verificationCode: null,
          },
        }))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("Invalid input", async () => {
    await expect(
      (async () =>
        await graphql.client.request(verifyRegistrationQuery, {
          input: null,
        }))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("No input", async () => {
    await expect(
      (async () =>
        await graphql.client.request(verifyRegistrationQuery, null))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
});
