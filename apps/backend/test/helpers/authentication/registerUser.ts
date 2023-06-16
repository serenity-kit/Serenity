import { clientRegistrationFinish } from "@serenity-kit/opaque";
import {
  createAndEncryptDevice,
  encryptWorkspaceInvitationPrivateKey,
} from "@serenity-tools/common";
import { gql } from "graphql-request";
import sodium from "react-native-libsodium";
import { loginUser } from "./loginUser";
import { requestRegistrationChallengeResponse } from "./requestRegistrationChallengeResponse";
import { verifyUser } from "./verifyUser";

let result: any = null;

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
  const clientRegistrationFinishResult = clientRegistrationFinish({
    password,
    clientRegistration: result.registration,
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

  const mainDevice = createAndEncryptDevice(exportKey);
  const {
    encryptionPrivateKey,
    signingPrivateKey,
    ...mainDeviceWithoutPrivateKeys
  } = mainDevice;

  let pendingWorkspaceInvitationKeyCiphertext: string | null = null;
  let pendingWorkspaceInvitationKeyPublicNonce: string | null = null;
  let pendingWorkspaceInvitationKeySubkeyId: number | null = null;
  let pendingWorkspaceInvitationKeyEncryptionSalt: string | null = null;
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
    pendingWorkspaceInvitationKeyEncryptionSalt =
      workspaceInvitationKeyData.encryptionKeySalt;
  }

  const registrationResponse = await graphql.client.request(query, {
    input: {
      message: clientRegistrationFinishResult.registrationUpload,
      username,
      mainDevice: mainDeviceWithoutPrivateKeys,
      pendingWorkspaceInvitationId,
      pendingWorkspaceInvitationKeyCiphertext,
      pendingWorkspaceInvitationKeyPublicNonce,
      pendingWorkspaceInvitationKeySubkeyId,
      pendingWorkspaceInvitationKeyEncryptionSalt,
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
    pendingWorkspaceInvitationKeyEncryptionSalt,
  };
};
