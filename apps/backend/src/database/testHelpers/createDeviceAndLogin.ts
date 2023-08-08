import { client, server } from "@serenity-kit/opaque";
import { createDevice } from "@serenity-tools/common";
import { addDays } from "../../utils/addDays/addDays";
import { createSessionAndDevice } from "../authentication/createSessionAndDevice";

type Params = {
  username: string;
  password: string;
  envelope: string;
};

export const createDeviceAndLogin = async ({
  username,
  password,
  envelope,
}: Params) => {
  if (!process.env.OPAQUE_SERVER_SETUP) {
    throw new Error("OPAQUE_SERVER_SETUP is not set");
  }

  const clientLoginStartResult = client.startLogin({ password });
  const serverLoginStartResult = server.startLogin({
    registrationRecord: envelope,
    startLoginRequest: clientLoginStartResult.startLoginRequest,
    serverSetup: process.env.OPAQUE_SERVER_SETUP,
    userIdentifier: username,
  });
  const loginStartResponse = client.finishLogin({
    loginResponse: serverLoginStartResult.loginResponse,
    clientLoginState: clientLoginStartResult.clientLoginState,
    password,
  });

  if (!loginStartResponse) {
    throw new Error("Login failed");
  }

  const webDevice = createDevice();

  const session = await createSessionAndDevice({
    username,
    sessionKey: loginStartResponse.sessionKey,
    expiresAt: addDays(new Date(), 30),
    device: {
      ...webDevice,
      info: JSON.stringify({
        type: "web",
        OS: "MacOS",
        OsVersion: null,
        Browser: "chrome",
        BrowserVersion: "100.0.1",
      }),
    },
  });
  return {
    session,
    sessionKey: loginStartResponse.sessionKey,
    webDevice,
  };
};
