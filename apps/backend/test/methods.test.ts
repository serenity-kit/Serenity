import { gql } from "graphql-request";
import setupGraphql from "./helpers/setupGraphql";
import sodium from "libsodium-wrappers-sumo";
import deleteAllRecords from "./helpers/deleteAllRecords";
import {
  createOprfChallenge,
  createClientKeyPair,
  createOprfRegistrationEnvelope,
  createUserSession,
} from "@serenity-tools/opaque/client";
import {
  // generateClientOprfChallenge,
  // createRegistrationEnvelope,
  createOprfChallengeResponse,
  generateOprfKeyPair,
  generateKeyPair,
  // createUserLoginSession,
} from "@serenity-tools/opaque/server";

const graphql = setupGraphql();
const username = "user";
const password = "password";

beforeAll(async () => {
  await deleteAllRecords();
});

test.skip("generate oprf challenge", async () => {
  //   // STAGE 1: REGISTER
  //   // CLIENT: Create challenge
  //   const clientChallenge = await createOprfChallenge(password);
  //   const serverChallengeBin = generateClientOprfChallenge(password);
  //   const serverChallenge = {
  //     oprfChallenge: sodium.to_base64(serverChallengeBin.oprfChallenge),
  //     randomScalar: sodium.to_base64(serverChallengeBin.randomScalar),
  //   };
  //   console.log({ clientChallenge, serverChallenge });
  //   // CLIENT: Create keypair
  //   const clientKeys = createClientKeyPair();
  //   const clientPublicKey = clientKeys.publicKey;
  //   const clientPrivateKey = clientKeys.privateKey;
  //   // SERVER: Create keypairs
  //   const oprfKeys = generateOprfKeyPair();
  //   const oprfPublicKey = oprfKeys.publicKey;
  //   const oprfPrivateKey = oprfKeys.privateKey;
  //   const serverKeys = generateKeyPair();
  //   const serverPublicKey = serverKeys.publicKey;
  //   const serverPrivateKey = serverKeys.privateKey;
  //   // SERVER: Create challenge response
  //   const clientOprfChallengeResponse = createOprfChallengeResponse(
  //     sodium.from_base64(serverChallenge.oprfChallenge),
  //     oprfPrivateKey
  //   );
  //   const serverOprfChallengeResponse = createOprfChallengeResponse(
  //     serverChallengeBin.oprfChallenge,
  //     oprfPrivateKey
  //   );
  //   // CLIENT: Create registration envelope
  //   const clientRegistrationEnvelope = await createOprfRegistrationEnvelope(
  //     password,
  //     clientPublicKey,
  //     clientPrivateKey,
  //     clientChallenge.randomScalar,
  //     sodium.to_base64(clientOprfChallengeResponse),
  //     sodium.to_base64(serverPublicKey),
  //     sodium.to_base64(oprfPublicKey)
  //   );
  //   const serverRegistrationEnvelopeBin = createRegistrationEnvelope(
  //     sodium.from_base64(clientPrivateKey),
  //     sodium.from_base64(clientPublicKey),
  //     password,
  //     serverOprfChallengeResponse,
  //     oprfPublicKey,
  //     sodium.from_base64(serverChallenge.randomScalar),
  //     serverPublicKey
  //   );
  //   const serverRegistrationEnvelope = {
  //     secret: sodium.to_base64(serverRegistrationEnvelopeBin.secret),
  //     nonce: sodium.to_base64(serverRegistrationEnvelopeBin.nonce),
  //   };
  //   console.log({ clientRegistrationEnvelope, serverRegistrationEnvelope });
  //   // STAGE 2: LOGIN
  //   // Client: Create login challenge
  //   const clientLoginChallenge = await createOprfChallenge(password);
  //   const serverLoginChallengeBin = generateClientOprfChallenge(password);
  //   const serverLoginChallenge = {
  //     oprfChallenge: sodium.to_base64(serverLoginChallengeBin.oprfChallenge),
  //     randomScalar: sodium.to_base64(serverLoginChallengeBin.randomScalar),
  //   };
  //   console.log({ clientLoginChallenge, serverLoginChallenge });
  //   // SERVER: Create challenge response
  //   const clientLoginOprfChallengeResponse = createOprfChallengeResponse(
  //     sodium.from_base64(serverLoginChallenge.oprfChallenge),
  //     oprfPrivateKey
  //   );
  //   const serverLoginOprfChallengeResponse = createOprfChallengeResponse(
  //     serverLoginChallengeBin.oprfChallenge,
  //     oprfPrivateKey
  //   );
  //   const clientClientSharedKeys = await createUserSession(
  //     password,
  //     clientRegistrationEnvelope.secret,
  //     clientRegistrationEnvelope.nonce,
  //     sodium.to_base64(oprfPublicKey),
  //     clientChallenge.randomScalar,
  //     sodium.to_base64(clientOprfChallengeResponse)
  //   );
  //   const serverClientSharedKeysBin = createUserLoginSession(
  //     password,
  //     serverRegistrationEnvelopeBin.secret,
  //     serverRegistrationEnvelopeBin.nonce,
  //     oprfPublicKey,
  //     serverChallengeBin.randomScalar,
  //     serverOprfChallengeResponse
  //   );
  //   const serverClientSharedKeys = {
  //     sharedRx: sodium.to_base64(serverClientSharedKeysBin.sharedRx),
  //     sharedTx: sodium.to_base64(serverClientSharedKeysBin.sharedTx),
  //   };
  //   console.log({ clientClientSharedKeys, serverClientSharedKeys });
});
