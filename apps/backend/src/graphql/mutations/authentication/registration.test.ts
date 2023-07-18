import { client } from "@serenity-kit/opaque";
import {
  createAndEncryptDevice,
  encryptWorkspaceInvitationPrivateKey,
  generateId,
} from "@serenity-tools/common";
import { gql } from "graphql-request";
import sodium from "react-native-libsodium";
import { requestRegistrationChallengeResponse } from "../../../../test/helpers/authentication/requestRegistrationChallengeResponse";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { prisma } from "../../../database/prisma";

const graphql = setupGraphql();
const username = `${generateId()}@example.com`;
const password = "password";
let result: any = null;

beforeAll(async () => {
  await deleteAllRecords();
});

test("server should create a registration challenge response", async () => {
  // generate a challenge code
  result = await requestRegistrationChallengeResponse(
    graphql,
    username,
    password
  );
  expect(result.data).toBeDefined();
  expect(typeof result.data.challengeResponse).toBe("string");
});

test("server should register a user", async () => {
  const clientRegistrationFinishResult = client.finishRegistration({
    password,
    clientRegistrationState: result.clientRegistrationState,
    registrationResponse: result.data.challengeResponse,
  });

  const query = gql`
    mutation finishRegistration($input: FinishRegistrationInput!) {
      finishRegistration(input: $input) {
        id
      }
    }
  `;

  const exportKey = clientRegistrationFinishResult.exportKey;
  const { signingPrivateKey, encryptionPrivateKey, ...mainDevice } =
    createAndEncryptDevice(sodium.to_base64(exportKey));

  const registrationResponse = await graphql.client.request(query, {
    input: {
      message: clientRegistrationFinishResult.registrationRecord,
      username,
      mainDevice,
    },
  });
  expect(typeof registrationResponse.finishRegistration.id).toBe("string");
});

test("server should register a user with a pending workspace id", async () => {
  const signingKeyPair = sodium.crypto_sign_keypair();
  const result = await requestRegistrationChallengeResponse(
    graphql,
    username,
    password
  );

  const pendingWorkspaceInvitationId = generateId();

  const clientRegistrationFinishResult = client.finishRegistration({
    password,
    clientRegistrationState: result.clientRegistrationState,
    registrationResponse: result.data.challengeResponse,
  });

  const query = gql`
    mutation finishRegistration($input: FinishRegistrationInput!) {
      finishRegistration(input: $input) {
        id
      }
    }
  `;

  const exportKey = clientRegistrationFinishResult.exportKey;
  const { signingPrivateKey, encryptionPrivateKey, ...mainDevice } =
    createAndEncryptDevice(exportKey);
  const workspaceInvitationKeyData = encryptWorkspaceInvitationPrivateKey({
    exportKey,
    workspaceInvitationSigningPrivateKey: sodium.to_base64(
      signingKeyPair.privateKey
    ),
  });

  const registrationResponse = await graphql.client.request(query, {
    input: {
      message: clientRegistrationFinishResult.registrationRecord,
      username,
      mainDevice,
      pendingWorkspaceInvitationId,
      pendingWorkspaceInvitationKeyCiphertext:
        workspaceInvitationKeyData.ciphertext,
      pendingWorkspaceInvitationKeyPublicNonce:
        workspaceInvitationKeyData.publicNonce,
      pendingWorkspaceInvitationKeySubkeyId:
        workspaceInvitationKeyData.subkeyId,
      pendingWorkspaceInvitationKeyEncryptionSalt:
        workspaceInvitationKeyData.encryptionKeySalt,
    },
  });
  expect(typeof registrationResponse.finishRegistration.id).toBe("string");

  const id = registrationResponse.finishRegistration.id;
  const unverifiedUser = await prisma.unverifiedUser.findFirst({
    where: {
      id,
    },
  });
  expect(unverifiedUser?.pendingWorkspaceInvitationId).toBe(
    pendingWorkspaceInvitationId
  );
});

describe("Input errors", () => {
  const query = gql`
    mutation finishRegistration($input: FinishRegistrationInput!) {
      finishRegistration(input: $input) {
        id
      }
    }
  `;
  test("Invalid email", async () => {
    await expect(
      (async () =>
        await requestRegistrationChallengeResponse(
          graphql,
          "invalid-email",
          password
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });

  test("pendingWorkspaceInvitationId without other data", async () => {
    const result = await requestRegistrationChallengeResponse(
      graphql,
      username,
      password
    );
    const pendingWorkspaceInvitationId = generateId();
    const clientRegistrationFinishResult = client.finishRegistration({
      password,
      clientRegistrationState: result.clientRegistrationState,
      registrationResponse: result.data.challengeResponse,
    });
    const exportKey = clientRegistrationFinishResult.exportKey;
    const { signingPrivateKey, encryptionPrivateKey, ...mainDevice } =
      createAndEncryptDevice(sodium.to_base64(exportKey));
    await expect(
      (async () =>
        await graphql.client.request(query, {
          input: {
            message: clientRegistrationFinishResult.registrationRecord,
            username,
            mainDevice,
            pendingWorkspaceInvitationId,
            pendingWorkspaceInvitationKeyCiphertext: null,
            pendingWorkspaceInvitationKeyPublicNonce: null,
            pendingWorkspaceInvitationKeySubkeyId: null,
            pendingWorkspaceInvitationKeyEncryptionSalt: null,
          },
        }))()
    ).rejects.toThrowError();
  });
  test("Invalid message", async () => {
    const result = await requestRegistrationChallengeResponse(
      graphql,
      username,
      password
    );
    const pendingWorkspaceInvitationId = generateId();
    const clientRegistrationFinishResult = client.finishRegistration({
      password,
      clientRegistrationState: result.clientRegistrationState,
      registrationResponse: result.data.challengeResponse,
    });
    const exportKey = clientRegistrationFinishResult.exportKey;
    const { signingPrivateKey, encryptionPrivateKey, ...mainDevice } =
      createAndEncryptDevice(sodium.to_base64(exportKey));
    await expect(
      (async () =>
        await graphql.client.request(query, {
          input: {
            message: null,
            username,
            mainDevice,
            pendingWorkspaceInvitationId,
          },
        }))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("Invalid mainDevice", async () => {
    const result = await requestRegistrationChallengeResponse(
      graphql,
      username,
      password
    );
    const pendingWorkspaceInvitationId = generateId();
    const clientRegistrationFinishResult = client.finishRegistration({
      password,
      clientRegistrationState: result.clientRegistrationState,
      registrationResponse: result.data.challengeResponse,
    });
    const exportKey = clientRegistrationFinishResult.exportKey;
    const { signingPrivateKey, encryptionPrivateKey, ...mainDevice } =
      createAndEncryptDevice(sodium.to_base64(exportKey));
    await expect(
      (async () =>
        await graphql.client.request(query, {
          input: {
            message: clientRegistrationFinishResult.registrationRecord,
            username,
            mainDevice: null,
            pendingWorkspaceInvitationId,
          },
        }))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("Invalid mainDevice.ciphertext", async () => {
    const result = await requestRegistrationChallengeResponse(
      graphql,
      username,
      password
    );
    const pendingWorkspaceInvitationId = generateId();
    const clientRegistrationFinishResult = client.finishRegistration({
      password,
      clientRegistrationState: result.clientRegistrationState,
      registrationResponse: result.data.challengeResponse,
    });
    const exportKey = clientRegistrationFinishResult.exportKey;
    const {
      signingPrivateKey,
      encryptionPrivateKey,
      ciphertext,
      ...mainDevice
    } = createAndEncryptDevice(sodium.to_base64(exportKey));
    await expect(
      (async () =>
        await graphql.client.request(query, {
          input: {
            message: clientRegistrationFinishResult.registrationRecord,
            username,
            mainDevice,
            pendingWorkspaceInvitationId,
          },
        }))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("Invalid mainDevice.nonce", async () => {
    const result = await requestRegistrationChallengeResponse(
      graphql,
      username,
      password
    );
    const pendingWorkspaceInvitationId = generateId();
    const clientRegistrationFinishResult = client.finishRegistration({
      password,
      clientRegistrationState: result.clientRegistrationState,
      registrationResponse: result.data.challengeResponse,
    });
    const exportKey = clientRegistrationFinishResult.exportKey;
    const { signingPrivateKey, encryptionPrivateKey, nonce, ...mainDevice } =
      createAndEncryptDevice(sodium.to_base64(exportKey));
    await expect(
      (async () =>
        await graphql.client.request(query, {
          input: {
            message: clientRegistrationFinishResult.registrationRecord,
            username,
            mainDevice,
            pendingWorkspaceInvitationId,
          },
        }))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("Invalid mainDevice.encryptionKeySalt", async () => {
    const result = await requestRegistrationChallengeResponse(
      graphql,
      username,
      password
    );
    const pendingWorkspaceInvitationId = generateId();
    const clientRegistrationFinishResult = client.finishRegistration({
      password,
      clientRegistrationState: result.clientRegistrationState,
      registrationResponse: result.data.challengeResponse,
    });
    const exportKey = clientRegistrationFinishResult.exportKey;
    const {
      signingPrivateKey,
      encryptionPrivateKey,
      encryptionKeySalt,
      ...mainDevice
    } = createAndEncryptDevice(sodium.to_base64(exportKey));
    await expect(
      (async () =>
        await graphql.client.request(query, {
          input: {
            message: clientRegistrationFinishResult.registrationRecord,
            username,
            mainDevice,
            pendingWorkspaceInvitationId,
          },
        }))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("Invalid mainDevice.signingPublicKey", async () => {
    const result = await requestRegistrationChallengeResponse(
      graphql,
      username,
      password
    );
    const pendingWorkspaceInvitationId = generateId();
    const clientRegistrationFinishResult = client.finishRegistration({
      password,
      clientRegistrationState: result.clientRegistrationState,
      registrationResponse: result.data.challengeResponse,
    });
    const exportKey = clientRegistrationFinishResult.exportKey;
    const {
      signingPrivateKey,
      encryptionPrivateKey,
      signingPublicKey,
      ...mainDevice
    } = createAndEncryptDevice(sodium.to_base64(exportKey));
    await expect(
      (async () =>
        await graphql.client.request(query, {
          input: {
            message: clientRegistrationFinishResult.registrationRecord,
            username,
            mainDevice,
            pendingWorkspaceInvitationId,
          },
        }))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("Invalid mainDevice.encryptionPublicKey", async () => {
    const result = await requestRegistrationChallengeResponse(
      graphql,
      username,
      password
    );
    const pendingWorkspaceInvitationId = generateId();
    const clientRegistrationFinishResult = client.finishRegistration({
      password,
      clientRegistrationState: result.clientRegistrationState,
      registrationResponse: result.data.challengeResponse,
    });
    const exportKey = clientRegistrationFinishResult.exportKey;
    const {
      signingPrivateKey,
      encryptionPrivateKey,
      encryptionPublicKey,
      ...mainDevice
    } = createAndEncryptDevice(sodium.to_base64(exportKey));
    await expect(
      (async () =>
        await graphql.client.request(query, {
          input: {
            message: clientRegistrationFinishResult.registrationRecord,
            username,
            mainDevice,
            pendingWorkspaceInvitationId,
          },
        }))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("Invalid mainDevice.encryptionPublicKeySignature", async () => {
    const result = await requestRegistrationChallengeResponse(
      graphql,
      username,
      password
    );
    const pendingWorkspaceInvitationId = generateId();
    const clientRegistrationFinishResult = client.finishRegistration({
      password,
      clientRegistrationState: result.clientRegistrationState,
      registrationResponse: result.data.challengeResponse,
    });
    const exportKey = clientRegistrationFinishResult.exportKey;
    const {
      signingPrivateKey,
      encryptionPrivateKey,
      encryptionPublicKeySignature,
      ...mainDevice
    } = createAndEncryptDevice(sodium.to_base64(exportKey));
    await expect(
      (async () =>
        await graphql.client.request(query, {
          input: {
            message: clientRegistrationFinishResult.registrationRecord,
            username,
            mainDevice,
            pendingWorkspaceInvitationId,
          },
        }))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("Invalid input", async () => {
    await expect(
      (async () =>
        await graphql.client.request(query, {
          input: null,
        }))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("No input", async () => {
    await expect(
      (async () => await graphql.client.request(query, null))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
});
