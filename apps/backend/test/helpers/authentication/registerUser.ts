import { client } from "@serenity-kit/opaque";
import * as userChain from "@serenity-kit/user-chain";
import {
  createAndEncryptMainDevice,
  encryptWorkspaceInvitationPrivateKey,
} from "@serenity-tools/common";
import { gql } from "graphql-request";
import sodium from "react-native-libsodium";
import { loginUser } from "./loginUser";
import {
  RegistrationChallengeResponse,
  requestRegistrationChallengeResponse,
} from "./requestRegistrationChallengeResponse";
import { verifyUser } from "./verifyUser";

let result: RegistrationChallengeResponse;

export const registerUser = async (
  graphql: any,
  username: string,
  password: string,
  pendingWorkspaceInvitationId?: string
) => {
  result = await requestRegistrationChallengeResponse(
    graphql,
    username,
    password
  );
  const clientRegistrationFinishResult = client.finishRegistration({
    password,
    clientRegistrationState: result.clientRegistrationState,
    registrationResponse: result.data.challengeResponse,
  });

  const query = gql`
    mutation finishRegistration($input: FinishRegistrationInput!) {
      finishRegistration(input: $input) {
        id
        verificationCode
      }
    }
  `;

  const exportKey = clientRegistrationFinishResult.exportKey;

  const mainDevice = createAndEncryptMainDevice(exportKey);
  const {
    encryptionPrivateKey,
    signingPrivateKey,
    ...mainDeviceWithoutPrivateKeys
  } = mainDevice;

  let pendingWorkspaceInvitationKeyCiphertext: string | null = null;
  let pendingWorkspaceInvitationKeyPublicNonce: string | null = null;
  let pendingWorkspaceInvitationKeySubkeyId: number | null = null;
  if (pendingWorkspaceInvitationId) {
    const signingKeyPair = sodium.crypto_sign_keypair();
    const workspaceInvitationKeyData = encryptWorkspaceInvitationPrivateKey({
      exportKey,
      workspaceInvitationSigningPrivateKey: sodium.to_base64(
        signingKeyPair.privateKey
      ),
    });
    pendingWorkspaceInvitationKeyCiphertext =
      workspaceInvitationKeyData.ciphertext;
    pendingWorkspaceInvitationKeyPublicNonce =
      workspaceInvitationKeyData.publicNonce;
    pendingWorkspaceInvitationKeySubkeyId = workspaceInvitationKeyData.subkeyId;
  }

  const createChainEvent = userChain.createChain({
    authorKeyPair: {
      privateKey: signingPrivateKey,
      publicKey: mainDevice.signingPublicKey,
    },
    email: username,
    encryptionPublicKey: mainDevice.encryptionPublicKey,
  });

  const registrationResponse = await graphql.client.request(query, {
    input: {
      registrationRecord: clientRegistrationFinishResult.registrationRecord,
      mainDevice: mainDeviceWithoutPrivateKeys,
      pendingWorkspaceInvitationId,
      pendingWorkspaceInvitationKeyCiphertext,
      pendingWorkspaceInvitationKeyPublicNonce,
      pendingWorkspaceInvitationKeySubkeyId,
      serializedUserChainEvent: JSON.stringify(createChainEvent),
    },
  });

  const verifyRegistrationResponse = await verifyUser({
    graphql,
    username,
    verificationCode: registrationResponse.finishRegistration.verificationCode,
  });

  const { sessionKey, device } = await loginUser({
    graphql,
    username,
    password,
    mainDevice,
  });
  return {
    userId: verifyRegistrationResponse.verifyRegistration.id,
    mainDeviceSigningPublicKey: mainDevice.signingPublicKey,
    mainDevice: mainDevice,
    webDevice: device,
    encryptionPrivateKey,
    signingPrivateKey,
    sessionKey,
    pendingWorkspaceInvitationId,
    pendingWorkspaceInvitationKeyCiphertext,
    pendingWorkspaceInvitationKeyPublicNonce,
    pendingWorkspaceInvitationKeySubkeyId,
  };
};
