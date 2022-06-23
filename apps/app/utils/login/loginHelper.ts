import {
  useStartLoginMutation,
  useFinishLoginMutation,
  MainDeviceQuery,
  MainDeviceDocument,
} from "../../generated/graphql";
import { useAuthentication } from "../../context/AuthenticationContext";
import { startLogin, finishLogin } from "@serenity-tools/opaque";
import { decryptDevice } from "@serenity-tools/common";
import { setMainDevice } from "../../utils/mainDeviceMemoryStore/mainDeviceMemoryStore";
import { Client } from "urql";

export type LoginParams = {
  username: string;
  password: string;
  startLoginMutation: any;
  finishLoginMutation: any;
  updateAuthentication: any;
};
export const login = async ({
  username,
  password,
  startLoginMutation,
  finishLoginMutation,
  updateAuthentication,
}: LoginParams) => {
  const message = await startLogin(password);
  const startLoginResult = await startLoginMutation({
    input: {
      username: username,
      challenge: message,
    },
  });
  // check for an error
  if (startLoginResult.data?.startLogin) {
    const result = await finishLogin(
      startLoginResult.data.startLogin.challengeResponse
    );

    const finishLoginResult = await finishLoginMutation({
      input: {
        loginId: startLoginResult.data.startLogin.loginId,
        message: result.response,
      },
    });

    if (finishLoginResult.data?.finishLogin) {
      updateAuthentication(
        finishLoginResult.data.finishLogin.mainDeviceSigningPublicKey
      );
      return result;
    } else if (finishLoginResult.error) {
      throw new Error("Failed to finish login");
    }
  } else if (startLoginResult.error) {
    console.error(startLoginResult.error);
    throw new Error("Failed to start login");
  }
  throw new Error("Failed to login");
};

export type FetchMainDeviceParams = {
  urqlClient: Client;
  exportKey: string;
};
export const fetchMainDevice = async ({
  urqlClient,
  exportKey,
}: FetchMainDeviceParams) => {
  const mainDeviceResult = await urqlClient
    .query<MainDeviceQuery>(MainDeviceDocument, undefined, {
      // better to be safe here and always refetch
      requestPolicy: "network-only",
    })
    .toPromise();

  if (mainDeviceResult.data?.mainDevice) {
    const mainDevice = mainDeviceResult.data.mainDevice;

    const privateKeys = await decryptDevice({
      ciphertext: mainDevice.ciphertext,
      encryptionKeySalt: mainDevice.encryptionKeySalt,
      nonce: mainDevice.nonce,
      exportKey,
    });
    setMainDevice({
      encryptionPrivateKey: privateKeys.encryptionPrivateKey,
      signingPrivateKey: privateKeys.signingPrivateKey,
      signingPublicKey: mainDevice.signingPublicKey,
      encryptionPublicKey: mainDevice.encryptionPublicKey,
    });
  } else {
    throw new Error("Failed to fetch main device.");
  }
};

/**
 * This function is designed to handle post-login routing logic
 * The reason is that maybe a user clicks a link to a document
 * but then isn't logged in, so they have to pass through the login
 * screen, then get forwarded by the login screen to the document.
 *
 * This function will abstract that use case.
 *
 * @param navigation
 */
export const navigateToNextAuthenticatedPage = (navigation) => {
  navigation.navigate("Root");
};
