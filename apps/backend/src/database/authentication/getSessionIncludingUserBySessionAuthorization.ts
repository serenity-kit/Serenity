import { kdfDeriveFromKey } from "@serenity-tools/common/src/kdfDeriveFromKey/kdfDeriveFromKey";
import { to_base64 } from "react-native-libsodium";
import { prisma } from "../prisma";

type Params = {
  authorization: string;
};

export const splitSessionAuthorization = ({ authorization }: Params) => {
  const [sessionToken, date, dateToken] = authorization.split("|");
  return { sessionToken, date, dateToken };
};

export const isValidSessionAuthorization = async ({
  sessionKey,
  authorization,
}: {
  sessionKey: string;
  authorization: string;
}) => {
  const { date, dateToken } = splitSessionAuthorization({
    authorization,
  });

  const { key: sessionDatetimeSubkey } = kdfDeriveFromKey({
    key: sessionKey,
    context: "session_datetime",
    subkeyId: to_base64(date),
  });

  // check that date is not older than 3 hours but also not more than 3 hours in the future
  const dateTimestamp = new Date(date).getTime();
  const nowTimestamp = new Date().getTime();
  const threeHoursInMs = 3 * 60 * 60 * 1000;
  if (
    dateTimestamp > nowTimestamp - threeHoursInMs &&
    dateTimestamp < nowTimestamp + threeHoursInMs &&
    sessionDatetimeSubkey === dateToken
  ) {
    return true;
  }
  return false;
};

export async function getSessionIncludingUserBySessionAuthorization({
  authorization,
}: Params) {
  const { sessionToken } = splitSessionAuthorization({
    authorization,
  });
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

  if (
    !isValidSessionAuthorization({
      sessionKey: session.sessionKey,
      authorization,
    })
  ) {
    return null;
  }

  return session;
}
