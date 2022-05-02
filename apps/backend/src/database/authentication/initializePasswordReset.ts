import OTP from "otp";
import {
  createOprfChallengeResponse,
  generateKeyPair,
  generateOprfKeyPair,
} from "@serenity-tools/opaque/server";
import sodium from "libsodium-wrappers-sumo";
import { prisma } from "../prisma";
const HOTP_TIMEOUT_MINUTES = 60;
const HOTP_KEY_SIZE = 128;
const HOTP_NAME = "serenity";

type InitializePasswordResetData = {
  serverPrivateKey: Uint8Array;
  serverPublicKey: Uint8Array;
  oprfPrivateKey: Uint8Array;
  oprfPublicKey: Uint8Array;
  oprfChallengeResponse: Uint8Array;
};

export async function initializePasswordReset(
  username: string,
  clientOprfChallenge: Uint8Array
): Promise<InitializePasswordResetData> {
  const serverKeyPairs = generateKeyPair();
  const oprfKeyPair = generateOprfKeyPair();
  const oprfChallengeResponse = createOprfChallengeResponse(
    clientOprfChallenge,
    oprfKeyPair.privateKey
  );
  // check if this user already exists
  // if so, we can generate an OTP and expiration timestamp
  // and then send that data to the user
  const user = await prisma.user.findUnique({
    where: {
      username: username,
    },
  });
  // TODO: Should we alert that the user doesn't exist?
  // or should we pretend this worked, to obscure data from attackers
  if (!user) {
    throw Error("This username has not yet been registered");
  }
  // create otp
  const otp = new OTP({
    name: HOTP_NAME,
    keySize: HOTP_KEY_SIZE,
    codeLength: 6,
    // epoch: Math.floor(Date.now() / 1000),
    timeSlice: HOTP_TIMEOUT_MINUTES * 60,
  });
  // otp.HOTP(Math.floor(Date.now() / 1000));
  const now = Math.floor(Date.now() / 1000);
  console.log({ now });
  console.log({ otp: otp.hotp(now) });
  const token = otp.hotp(now);
  // set the expiration at 60 minutes from now as a Date Object
  const expiresAtDatetime = new Date(
    Date.now() + HOTP_TIMEOUT_MINUTES * 60 * 1000
  );
  // reuse the registration object to load the key information
  try {
    await prisma.registration.update({
      where: {
        username: username,
      },
      data: {
        serverPrivateKey: sodium.to_base64(serverKeyPairs.privateKey),
        serverPublicKey: sodium.to_base64(serverKeyPairs.publicKey),
        oprfPrivateKey: sodium.to_base64(oprfKeyPair.privateKey),
        oprfPublicKey: sodium.to_base64(oprfKeyPair.publicKey),
      },
    });
  } catch (error) {
    console.error("Error saving registration");
    console.log(error);
    throw Error("User does not exist");
  }
  // save the otp to the user
  try {
    await prisma.user.update({
      where: {
        username: username,
      },
      data: {
        passwordResetOneTimePassword: token,
        passwordResetOneTimePasswordExpireDateTime: expiresAtDatetime,
      },
    });
  } catch (error) {
    console.error("Error saving registered");
    console.log(error);
    throw Error("User does not exist");
  }

  return {
    serverPrivateKey: serverKeyPairs.privateKey,
    serverPublicKey: serverKeyPairs.privateKey,
    oprfPrivateKey: oprfKeyPair.privateKey,
    oprfPublicKey: oprfKeyPair.publicKey,
    oprfChallengeResponse,
  };
}
