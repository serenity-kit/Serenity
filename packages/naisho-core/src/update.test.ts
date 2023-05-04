import sodiumWrappers from "libsodium-wrappers";
import sodium, { KeyPair } from "react-native-libsodium";
import { UpdatePublicData } from "./types";
import { createUpdate, verifyAndDecryptUpdate } from "./update";
import { generateId } from "./utils/generateId";

test("createUpdate & verifyAndDecryptUpdate successfully", async () => {
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

  const publicData: UpdatePublicData = {
    refSnapshotId: generateId(),
    docId: "6e46c006-5541-11ec-bf63-0242ac130002",
    pubKey: sodium.to_base64(signatureKeyPair.publicKey),
  };

  const update = createUpdate(
    "Hello World",
    publicData,
    key,
    signatureKeyPair,
    0
  );

  const { content, clock } = verifyAndDecryptUpdate(
    update,
    key,
    signatureKeyPair.publicKey,
    -1
  );
  if (content === null) {
    throw new Error("Update could not be verified.");
  }
  expect(sodium.to_string(content)).toBe("Hello World");
  expect(clock).toBe(0);
});

test("createUpdate & verifyAndDecryptUpdate successfully with higher clock number", async () => {
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

  const publicData: UpdatePublicData = {
    refSnapshotId: generateId(),
    docId: "6e46c006-5541-11ec-bf63-0242ac130002",
    pubKey: sodium.to_base64(signatureKeyPair.publicKey),
  };

  const update = createUpdate(
    "Hello World",
    publicData,
    key,
    signatureKeyPair,
    10
  );

  const { content, clock } = verifyAndDecryptUpdate(
    update,
    key,
    signatureKeyPair.publicKey,
    9
  );
  if (content === null) {
    throw new Error("Update could not be verified.");
  }
  expect(sodium.to_string(content)).toBe("Hello World");
  expect(clock).toBe(10);
});

test("createUpdate & verifyAndDecryptUpdate break due changed signature", async () => {
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

  const publicData: UpdatePublicData = {
    refSnapshotId: generateId(),
    docId: "6e46c006-5541-11ec-bf63-0242ac130002",
    pubKey: sodium.to_base64(signatureKeyPair.publicKey),
  };

  const update = createUpdate(
    "Hello World",
    publicData,
    key,
    signatureKeyPair,
    0
  );

  expect(() =>
    verifyAndDecryptUpdate(
      {
        ...update,
        signature: update.signature.replace(/^./, "a"),
      },
      key,
      signatureKeyPair.publicKey,
      -1
    )
  ).toThrowError();
});

test("createUpdate & verifyAndDecryptUpdate break due changed ciphertext", async () => {
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

  const publicData: UpdatePublicData = {
    refSnapshotId: generateId(),
    docId: "6e46c006-5541-11ec-bf63-0242ac130002",
    pubKey: sodium.to_base64(signatureKeyPair.publicKey),
  };

  const update = createUpdate(
    "Hello World",
    publicData,
    key,
    signatureKeyPair,
    0
  );

  expect(() =>
    verifyAndDecryptUpdate(
      {
        ...update,
        ciphertext: update.ciphertext.replace(/^./, "a"),
      },
      key,
      signatureKeyPair.publicKey,
      -1
    )
  ).toThrowError();
});

test("createUpdate & verifyAndDecryptUpdate fail due invalid clock", async () => {
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

  const publicData: UpdatePublicData = {
    refSnapshotId: generateId(),
    docId: "6e46c006-5541-11ec-bf63-0242ac130002",
    pubKey: sodium.to_base64(signatureKeyPair.publicKey),
  };

  const update = createUpdate(
    "Hello World",
    publicData,
    key,
    signatureKeyPair,
    0
  );

  expect(() =>
    verifyAndDecryptUpdate(update, key, signatureKeyPair.publicKey, 10)
  ).toThrowError();
});
