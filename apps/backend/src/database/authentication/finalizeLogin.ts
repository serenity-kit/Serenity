import sodium from "libsodium-wrappers-sumo";
import { prisma } from "../prisma";
import {
  generateNonce,
  generateOauthAccessToken,
} from "@serenity-tools/opaque/server";

type FinalizeLoginResponseData = {
  oauthData: string;
  nonce: string;
};

export async function finalizeLogin(
  username: string
): Promise<FinalizeLoginResponseData> {
  // if this user does not exist, we have a problem
  const userData = await prisma.user.findUnique({
    where: {
      username: username,
    },
  });
  if (!userData) {
    throw Error("User is not registered");
  }
  const serverPrivateKey = sodium.from_base64(userData.serverPrivateKey);
  // we used to use getPublicKeyFromPrivateKey(serverPrivateKey);
  // to derive the server public key, but it turns out that
  // the server pbulic key must be curve22519 but the method
  // relies on ed22519
  const serverPublicKey = sodium.from_base64(userData.serverPublicKey);
  const clientPublicKey = sodium.from_base64(userData.clientPublicKey);
  const serverSharedKeys = sodium.crypto_kx_server_session_keys(
    serverPublicKey,
    serverPrivateKey,
    clientPublicKey
  );

  const { accessToken, expiresAt } = generateOauthAccessToken();

  try {
    await prisma.userLoginAccessToken.create({
      data: {
        accessToken,
        expiresAt,
        user: {
          connect: {
            username,
          },
        },
      },
    });
  } catch (error) {
    throw Error("Internal server error");
  }
  const expiresIn = expiresAt.getTime() - Date.now();
  const oauthResponse = {
    accessToken,
    tokenType: "Bearer",
    expiresIn,
  };
  // generate nonce
  const nonce = generateNonce();
  // encrypt the oauth response
  const oauthResponseBytes = new Uint8Array(
    Buffer.from(JSON.stringify(oauthResponse))
  );
  const encryptedOauthResponseBytes = sodium.crypto_secretbox_easy(
    oauthResponseBytes,
    nonce,
    serverSharedKeys.sharedTx
  );
  // if the user creates a matching session_keys,
  // they will be able to decrypt this oauthData message
  return {
    oauthData: sodium.to_base64(encryptedOauthResponseBytes),
    nonce: sodium.to_base64(nonce),
  };
}
