import {
  clientLoginFinish,
  clientLoginStart,
  serverLoginStart,
} from "@serenity-kit/opaque";
import { createDevice } from "@serenity-tools/common";
import { addDays } from "../../utils/addDays/addDays";
import { createSession } from "../authentication/createSession";

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

  const clientLoginStartResult = clientLoginStart(password);
  const serverLoginStartResult = serverLoginStart({
    passwordFile: envelope,
    credentialRequest: clientLoginStartResult.credentialRequest,
    serverSetup: process.env.OPAQUE_SERVER_SETUP,
    userIdentifier: username,
  });
  const loginStartResponse = clientLoginFinish({
    credentialResponse: serverLoginStartResult.credentialResponse,
    clientLogin: clientLoginStartResult.clientLogin,
    password,
  });

  if (!loginStartResponse) {
    throw new Error("Login failed");
  }

  const webDevice = createDevice();

  const session = await createSession({
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
