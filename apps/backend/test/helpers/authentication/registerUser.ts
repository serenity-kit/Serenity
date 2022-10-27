import { createAndEncryptDevice } from "@serenity-tools/common";
import { gql } from "graphql-request";
import sodium from "libsodium-wrappers";
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

  const message = result.registration.finish(
    sodium.from_base64(result.data.challengeResponse)
  );
  const query = gql`
    mutation finishRegistration($input: FinishRegistrationInput!) {
      finishRegistration(input: $input) {
        id
        verificationCode
      }
    }
  `;

  const exportKey = result.registration.getExportKey();
  const { encryptionPrivateKey, signingPrivateKey, ...mainDevice } =
    await createAndEncryptDevice(sodium.to_base64(exportKey));

  const registrationResponse = await graphql.client.request(query, {
    input: {
      registrationId: result.data.registrationId,
      message: sodium.to_base64(message),
      mainDevice,
      pendingWorkspaceInvitationId,
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
  };
};
