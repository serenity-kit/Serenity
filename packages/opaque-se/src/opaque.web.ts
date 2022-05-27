import {
  AKEExportKeyPair,
  AuthClient,
  AuthServer,
  Config,
  CredentialFile,
  ExpectedAuthResult,
  KE1,
  KE2,
  KE3,
  OpaqueClient,
  OpaqueID,
  OpaqueServer,
  RegistrationClient,
  RegistrationRecord,
  RegistrationRequest,
  RegistrationResponse,
  RegistrationServer,
  getOpaqueConfig,
} from "@cloudflare/opaque-ts";
// import sodium from "@serenity-tools/libsodium";

const client: RegistrationClient = new OpaqueClient(
  getOpaqueConfig(OpaqueID.OPAQUE_P384)
);

export const registerInitialize = async (password: string) => {
  const request = await client.registerInit(password);
  if (request instanceof Error) {
    throw request;
  }
  return request.serialize();
};
