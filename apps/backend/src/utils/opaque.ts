import sodium from "libsodium-wrappers-sumo";
import {
  HandleRegistration,
  HandleLogin,
  ServerSetup,
} from "../vendor/opaque-wasm/opaque_wasm";

// Trade-off: by storing it in memory it means with a server restart registrations will be lost and fail
// Currently there is no cleanup mechanism.
// TODO let started registrations expire after a while
const registrations: {
  [username: string]: HandleRegistration;
} = {};

const logins: {
  [username: string]: HandleLogin;
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

export const startRegistration = async (
  username: string,
  challenge: string
) => {
  const serverRegistration = new HandleRegistration(opaqueServerSetup());
  const response = serverRegistration.start(
    // @ts-expect-error string just works fine
    username,
    sodium.from_base64(challenge)
  );
  registrations[username] = serverRegistration;
  return response;
};

// TODO use an registration ID generated in startRegistration instead of username
export const finishRegistration = async (username: string, message: string) => {
  const response = registrations[username].finish(sodium.from_base64(message));
  delete registrations[username];
  return sodium.to_base64(response);
};

export const startLogin = async (
  envelope: string,
  username: string,
  challenge: string
) => {
  const serverLogin = new HandleLogin(opaqueServerSetup());
  const response = serverLogin.start(
    sodium.from_base64(envelope),
    // @ts-expect-error string just works fine
    username,
    sodium.from_base64(challenge)
  );
  logins[username] = serverLogin;
  return sodium.to_base64(response);
};

// TODO use an login ID generated in startLogin instead of username
export const finishLogin = async (username: string, message: string) => {
  const response = logins[username].finish(sodium.from_base64(message));
  delete logins[username];
  return sodium.to_base64(response);
};
