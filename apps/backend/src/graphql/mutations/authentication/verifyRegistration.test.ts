import setupGraphql from "../../../../test/helpers/setupGraphql";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { requestRegistrationChallengeResponse } from "../../../../test/helpers/authentication/requestRegistrationChallengeResponse";
import { finalizeRegistration } from "../../../../test/helpers/authentication/finalizeRegistration";
import { prisma } from "../../../database/prisma";
import { MAX_UNVERIFIED_USER_CONFIRMATION_ATTEMPTS } from "../../../database/authentication/verifyRegistration";
import { verifyRegistration } from "../../../../test/helpers/authentication/verifyRegistration";

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
    where: {
      username,
    },
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
  ).rejects.toThrow(`Invalid confirmation code. Code reset.`);
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

test("successful verification results in user", async () => {
  const currentUnverifiedUser = await prisma.unverifiedUser.findFirst({
    where: {
      username,
    },
  });
  const confirmationCode = currentUnverifiedUser!.confirmationCode;
  const verifyRegistrationResult = await verifyRegistration({
    graphql,
    username,
    confirmationCode,
  });

  expect(typeof verifyRegistrationResult.verifyRegistration.id).toBe("string");
  const resultingUnverifiedUser = await prisma.unverifiedUser.findFirst({
    where: {
      username,
    },
  });
  const resultingUser = await prisma.user.findFirst({
    where: {
      username,
    },
  });
  expect(resultingUnverifiedUser).toBe(null);
  expect(resultingUser!.mainDeviceCiphertext).toBe(
    currentUnverifiedUser!.mainDeviceCiphertext
  );
});
