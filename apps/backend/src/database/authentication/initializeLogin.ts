import { createOprfChallengeResponse } from "@serenity-tools/opaque/server";
import { prisma } from "../prisma";
import sodium from "libsodium-wrappers-sumo";

type InitializeLoginResponseData = {
  userData: any;
  oprfChallengeResponse: Uint8Array;
};

export async function initializeLogin(
  username: string,
  clientOprfChallenge: Uint8Array
): Promise<InitializeLoginResponseData> {
  // if this user does not exist, we have a problem
  const userData = await prisma.user.findUnique({
    where: {
      username: username,
    },
  });
  if (!userData) {
    throw Error("User is not registered");
  }
  const oprfPrivateKey = sodium.from_base64(userData.oprfPrivateKey);
  const oprfChallengeResponse = createOprfChallengeResponse(
    clientOprfChallenge,
    oprfPrivateKey
  );
  return {
    userData,
    oprfChallengeResponse,
  };
}
