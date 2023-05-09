import sodiumWrappers from "libsodium-wrappers";
import sodium, { KeyPair } from "react-native-libsodium";
import {
  createEphemeralUpdate,
  verifyAndDecryptEphemeralUpdate,
} from "./ephemeralUpdate";
import { EphemeralUpdatePublicData } from "./types";

test("createEphemeralUpdate & verifyAndDecryptEphemeralUpdate successfully", async () => {
  await sodium.ready;

  const key = sodiumWrappers.from_hex(
    "724b092810ec86d7e35c9d067702b31ef90bc43a7b598626749914d6a3e033ed"
  );

  const signatureKeyPair: KeyPair = {
    privateKey: sodiumWrappers.from_base64(
      "g3dtwb9XzhSzZGkxTfg11t1KEIb4D8rO7K54R6dnxArvgg_OzZ2GgREtG7F5LvNp3MS8p9vsio4r6Mq7SZDEgw"
    ),
    publicKey: sodiumWrappers.from_base64(
      "74IPzs2dhoERLRuxeS7zadzEvKfb7IqOK-jKu0mQxIM"
    ),
    keyType: "ed25519",
  };

  const publicData: EphemeralUpdatePublicData = {
    docId: "6e46c006-5541-11ec-bf63-0242ac130002",
    pubKey: sodium.to_base64(signatureKeyPair.publicKey),
  };

  const ephemeralUpdate = createEphemeralUpdate(
    new Uint8Array([97, 97, 97]),
    publicData,
    key,
    signatureKeyPair
  );

  const { content, date } = verifyAndDecryptEphemeralUpdate(
    ephemeralUpdate,
    key,
    signatureKeyPair.publicKey
  );

  if (content === null) {
    throw new Error("Update could not be verified.");
  }
  expect(content[0]).toBe(97);
  expect(content[1]).toBe(97);
  expect(content[2]).toBe(97);
  expect(date).toBeInstanceOf(Date);
});