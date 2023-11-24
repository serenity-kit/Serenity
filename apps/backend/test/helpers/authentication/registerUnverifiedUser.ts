import { client, ready as opaqueReady } from "@serenity-kit/opaque";
import * as userChain from "@serenity-kit/user-chain";
import {
  createAndEncryptMainDevice,
  encryptWorkspaceInvitationPrivateKey,
} from "@serenity-tools/common";
import { gql } from "graphql-request";
import sodium from "react-native-libsodium";
import { TestContext } from "../setupGraphql";
import { requestRegistrationChallengeResponse } from "./requestRegistrationChallengeResponse";

export type Props = {
  graphql: TestContext;
  username: string;
  password: string;
  pendingWorkspaceInvitationId: string | null | undefined;
};
export const registerUnverifiedUser = async ({
  graphql,
  username,
  password,
  pendingWorkspaceInvitationId,
}: Props) => {
  await opaqueReady;
  const result = await requestRegistrationChallengeResponse(
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
  const {
    signingPrivateKey,
    encryptionPrivateKey,
    ciphertext: mainDeviceCiphertext,
    nonce: mainDeviceNonce,
    ...mainDevice
  } = createAndEncryptMainDevice(exportKey);

  let pendingWorkspaceInvitationKeyCiphertext: string | null = null;
  let pendingWorkspaceInvitationKeyPublicNonce: string | null = null;
  let pendingWorkspaceInvitationKeySubkeyId: string | null = null;
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

  const createChainEvent = userChain.createUserChain({
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
      encryptedMainDevice: {
        ciphertext: mainDeviceCiphertext,
        nonce: mainDeviceNonce,
      },
      pendingWorkspaceInvitationId,
      pendingWorkspaceInvitationKeyCiphertext,
      pendingWorkspaceInvitationKeyPublicNonce,
      pendingWorkspaceInvitationKeySubkeyId,
      serializedUserChainEvent: JSON.stringify(createChainEvent),
    },
  });
  return registrationResponse;
};
