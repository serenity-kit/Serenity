import sodium from "libsodium-wrappers";
import { v4 as uuidv4 } from "uuid";
import {
  HandleRegistration,
  HandleLogin,
  ServerSetup,
} from "../vendor/opaque-wasm/opaque_wasm";

// Trade-off: by storing it in memory it means with a server restart registrations will be lost and fail
// Currently there is no cleanup mechanism.
// TODO let started registrations expire after a while
const registrations: {
  [registrationId: string]: {
    handleRegistration: HandleRegistration;
    username: string;
  };
} = {};

const logins: { [loginId: string]: HandleLogin } = {};

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

export const startRegistration = async (
  username: string,
  challenge: string
) => {
  const registrationId = uuidv4();
  const serverRegistration = new HandleRegistration(opaqueServerSetup());
  const response = serverRegistration.start(
    // @ts-expect-error string just works fine
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

export const finishRegistration = async (
  registrationId: string,
  message: string
) => {
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

export const startLogin = async (
  envelope: string,
  username: string,
  challenge: string
) => {
  const loginId = uuidv4();
  const serverLogin = new HandleLogin(opaqueServerSetup());
  const response = serverLogin.start(
    sodium.from_base64(envelope),
    // @ts-expect-error string just works fine
    username,
    sodium.from_base64(challenge)
  );
  logins[loginId] = serverLogin;
  return {
    loginId,
    message: sodium.to_base64(response),
  };
};

export const finishLogin = async (loginId: string, message: string) => {
  console.log("DEBUG LOGIN: ", loginId, logins[loginId]);
  const response = logins[loginId].finish(sodium.from_base64(message));
  delete logins[loginId];
  return sodium.to_base64(response);
};
