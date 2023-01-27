import { gql } from "graphql-request";
import { v4 as uuidv4 } from "uuid";
import { finalizeRegistration } from "../../../../test/helpers/authentication/finalizeRegistration";
import { registerUnverifiedUser } from "../../../../test/helpers/authentication/registerUnverifiedUser";
import { requestRegistrationChallengeResponse } from "../../../../test/helpers/authentication/requestRegistrationChallengeResponse";
import { verifyRegistration } from "../../../../test/helpers/authentication/verifyRegistration";
import { verifyUser } from "../../../../test/helpers/authentication/verifyUser";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { MAX_UNVERIFIED_USER_CONFIRMATION_ATTEMPTS } from "../../../database/authentication/verifyRegistration";
import { prisma } from "../../../database/prisma";

const graphql = setupGraphql();

const username = "user1";
const password = "abc123";
let unverifiedUser: any;
let isUserRegistered = false;

const setup = async () => {
  const registrationChallengeResponse =
    await requestRegistrationChallengeResponse(graphql, username, password);
  const challengeResponse =
    registrationChallengeResponse.data.challengeResponse;
  const registrationId = registrationChallengeResponse.data.registrationId;
  const registration = registrationChallengeResponse.registration;
  await finalizeRegistration({
    graphql,
    challengeResponse,
    registrationId,
    registration,
    password,
  });
  unverifiedUser = await prisma.unverifiedUser.findFirst({
    where: {
      username,
    },
  });
};

beforeAll(async () => {
  await deleteAllRecords();
});

beforeEach(async () => {
  if (!isUserRegistered) {
    await setup();
    isUserRegistered = true;
  }
});

test("verify registration fails throws error", async () => {
  const confirmationCode = "badConfirmationCode";
  const confirmationTryCounter = unverifiedUser.confirmationTryCounter;
  const numAttemptsRemaining =
    MAX_UNVERIFIED_USER_CONFIRMATION_ATTEMPTS - confirmationTryCounter - 1;

  await expect(
    (async () =>
      await verifyRegistration({
        graphql,
        username,
        confirmationCode,
      }))()
  ).rejects.toThrow(
    `Invalid confirmation code. ${numAttemptsRemaining} attempts remaining`
  );
  const updatedUnverifiedUser = await prisma.unverifiedUser.findFirst({
    where: { username },
  });
  expect(updatedUnverifiedUser!.confirmationTryCounter).toBe(
    confirmationTryCounter + 1
  );
});

test("verify registration 5 times resets code", async () => {
  const confirmationCode = "badConfirmationCode";
  await prisma.unverifiedUser.updateMany({
    where: {
      username,
    },
    data: {
      confirmationTryCounter: MAX_UNVERIFIED_USER_CONFIRMATION_ATTEMPTS - 1,
    },
  });
  await expect(
    (async () =>
      await verifyRegistration({
        graphql,
        username,
        confirmationCode,
      }))()
  ).rejects.toThrow(/Too many attempts. Code reset./);
  const updatedUnverifiedUser = await prisma.unverifiedUser.findFirst({
    where: {
      username,
    },
  });
  expect(updatedUnverifiedUser!.confirmationTryCounter).toBe(0);
  expect(updatedUnverifiedUser!.confirmationCode).not.toBe(
    unverifiedUser.confirmationCode
  );
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
