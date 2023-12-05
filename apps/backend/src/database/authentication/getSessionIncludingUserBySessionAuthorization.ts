import { kdfDeriveFromKey } from "@serenity-tools/common/src/kdfDeriveFromKey/kdfDeriveFromKey";
import { to_base64 } from "react-native-libsodium";
import { prisma } from "../prisma";

type Params = {
  authorization: string;
};

export async function getSessionIncludingUserBySessionAuthorization({
  authorization,
}: Params) {
  const [sessionToken, date, dateToken] = authorization.split(".");
  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: { user: true },
  });
  if (!session) {
    return null;
  }
  if (session?.expiresAt && session.expiresAt < new Date()) {
    return null;
  }

  // check that date is not older than 3 hours but also not more than 3 hours in the future
  const dateTimestamp = new Date(date).getTime();
  const nowTimestamp = new Date().getTime();
  if (dateTimestamp < nowTimestamp - 3 * 60 * 60 * 1000) {
    return null;
  }
  if (dateTimestamp > nowTimestamp + 3 * 60 * 60 * 1000) {
    return null;
  }

  const { key: sessionDatetimeSubkey } = kdfDeriveFromKey({
    key: session.sessionKey,
    context: "session_datetime",
    subkeyId: to_base64(date),
  });
  if (sessionDatetimeSubkey !== dateToken) {
    return null;
  }

  return session;
}
