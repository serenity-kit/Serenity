import sodium from "libsodium-wrappers-sumo";
import { ServerSetup } from "../vendor/opaque-wasm/opaque_wasm";

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
