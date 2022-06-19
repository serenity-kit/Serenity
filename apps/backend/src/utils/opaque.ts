import sodium from "libsodium-wrappers";
import { v4 as uuidv4 } from "uuid";

// import type {
//   HandleRegistration as HandleRegistrationType,
//   HandleLogin as HandleLoginType,
// } from "@serenity-tools/opaque-server";

const {
  HandleRegistration,
  HandleLogin,
  ServerSetup,
} = require("@serenity-tools/opaque-server");

// Trade-off: by storing it in memory it means with a server restart registrations will be lost and fail
// Currently there is no cleanup mechanism.
// TODO let started registrations expire after a while
const registrations: {
  [registrationId: string]: {
    handleRegistration: any;
    username: string;
  };
} = {};

const logins: {
  [loginId: string]: {
    handleLogin: any;
    username: string;
  };
} = {};

// Create a new private key using
// const serverSetup = new ServerSetup();
// console.log(sodium.to_base64(serverSetup.serialize()));
export const opaqueServerSetup = () => {
  if (!process.env.OPAQUE_SERVER_PRIVATE_KEY) {
    throw Error("Missing process.env.OPAQUE_SERVER_PRIVATE_KEY");
  }
  return ServerSetup.deserialize(
    sodium.from_base64(process.env.OPAQUE_SERVER_PRIVATE_KEY)
  );
};

export const startRegistration = ({
  username,
  challenge,
}: {
  username: string;
  challenge: string;
}) => {
  const registrationId = uuidv4();
  const serverRegistration = new HandleRegistration(opaqueServerSetup());
  const response = serverRegistration.start(
    username,
    sodium.from_base64(challenge)
  );
  registrations[registrationId] = {
    handleRegistration: serverRegistration,
    username,
  };
  return {
    registrationId,
    response: sodium.to_base64(response),
  };
};

export const finishRegistration = ({
  registrationId,
  message,
}: {
  registrationId: string;
  message: string;
}) => {
  const response = registrations[registrationId].handleRegistration.finish(
    sodium.from_base64(message)
  );
  const username = registrations[registrationId].username;
  delete registrations[registrationId];
  return {
    envelope: sodium.to_base64(response),
    username,
  };
};

export const startLogin = ({
  envelope,
  username,
  challenge,
}: {
  envelope: string;
  username: string;
  challenge: string;
}) => {
  const loginId = uuidv4();
  const serverLogin = new HandleLogin(opaqueServerSetup());
  const response = serverLogin.start(
    sodium.from_base64(envelope),
    username,
    sodium.from_base64(challenge)
  );
  console.log("START LOGIN: after");
  logins[loginId] = {
    username,
    handleLogin: serverLogin,
  };
  return {
    loginId,
    message: sodium.to_base64(response),
  };
};

export const finishLogin = ({
  loginId,
  message,
}: {
  loginId: string;
  message: string;
}) => {
  const login = logins[loginId];
  const response = login.handleLogin.finish(sodium.from_base64(message));
  const username = login.username;
  delete logins[loginId];
  return {
    username,
    sessionKey: sodium.to_base64(response),
  };
};
