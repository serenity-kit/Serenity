import { to_base64 } from "react-native-libsodium";
import { kdfDeriveFromKey } from "../kdfDeriveFromKey/kdfDeriveFromKey";

type Params = {
  sessionKey: string;
};

export const deriveSessionAuthorization = ({ sessionKey }: Params) => {
  const datetime = new Date().toISOString();
  const { key: sessionDatetimeSubkey } = kdfDeriveFromKey({
    key: sessionKey,
    context: "session_datetime",
    subkeyId: to_base64(datetime),
  });
  const { key: sessionToken } = kdfDeriveFromKey({
    key: sessionKey,
    context: "session_token",
    subkeyId: "AQEBAQEBAQEBAQEBAQEBAQ",
  });
  return {
    authorization: `${sessionToken}|${datetime}|${sessionDatetimeSubkey}`,
    sessionToken,
  };
};
