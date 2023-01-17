import { createDevice } from "@serenity-tools/common";
import { Login } from "@serenity-tools/opaque-server";
import sodium from "react-native-libsodium";
import { addDays } from "../../utils/addDays/addDays";
import { finishLogin, startLogin } from "../../utils/opaque";
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
  const login = new Login();
  const loginChallenge = login.start(password);
  const { message: loginMessage, loginId } = startLogin({
    envelope,
    username,
    challenge: sodium.to_base64(loginChallenge),
  });
  const loginStartResponse = login.finish(
    password,
    sodium.from_base64(loginMessage)
  );

  const { sessionKey } = finishLogin({
    loginId,
    message: sodium.to_base64(loginStartResponse),
  });

  const webDevice = createDevice();

  const session = await createSession({
    username,
    sessionKey,
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
    sessionKey,
    webDevice,
  };
};
