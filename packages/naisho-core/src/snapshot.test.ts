import sodiumWrappers from "libsodium-wrappers";
import sodium, { KeyPair } from "react-native-libsodium";
import { createSnapshot, verifyAndDecryptSnapshot } from "./snapshot";
import { SnapshotPublicData } from "./types";
import { generateId } from "./utils/generateId";

const snapshotDerivedKeyContext = "snapshot";

test("createSnapshot & verifyAndDecryptSnapshot successfully", async () => {
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

  const snapshotId = generateId();
  const publicData: SnapshotPublicData = {
    snapshotId,
    docId: "6e46c006-5541-11ec-bf63-0242ac130002",
    pubKey: sodium.to_base64(signatureKeyPair.publicKey),
    subkeyId: 42,
    keyDerivationTrace: {
      workspaceKeyId: "abc",
      trace: [
        {
          entryId: snapshotId,
          parentId: null,
          subkeyId: 42,
          context: snapshotDerivedKeyContext,
        },
      ],
    },
  };

  const snapshot = createSnapshot(
    "Hello World",
    publicData,
    key,
    signatureKeyPair,
    "",
    ""
  );

  const result = verifyAndDecryptSnapshot(
    snapshot,
    key,
    signatureKeyPair.publicKey
  );
  if (result === null) {
    throw new Error("Snapshot could not be verified.");
  }
  expect(sodium.to_string(result)).toBe("Hello World");
});

test("createSnapshot & verifyAndDecryptSnapshot break due changed signature", async () => {
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
  const snapshotId = generateId();
  const publicData: SnapshotPublicData = {
    snapshotId: generateId(),
    docId: "6e46c006-5541-11ec-bf63-0242ac130002",
    pubKey: sodium.to_base64(signatureKeyPair.publicKey),
    subkeyId: 42,
    keyDerivationTrace: {
      workspaceKeyId: "abc",
      trace: [
        {
          entryId: snapshotId,
          parentId: null,
          subkeyId: 42,
          context: snapshotDerivedKeyContext,
        },
      ],
    },
  };

  const snapshot = createSnapshot(
    "Hello World",
    publicData,
    key,
    signatureKeyPair,
    "",
    ""
  );

  expect(() =>
    verifyAndDecryptSnapshot(
      {
        ...snapshot,
        signature: snapshot.signature.replace(/^./, "a"),
      },
      key,
      signatureKeyPair.publicKey
    )
  ).toThrowError();
});

test("createSnapshot & verifyAndDecryptSnapshot break due changed ciphertext", async () => {
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
  const snapshotId = generateId();
  const publicData: SnapshotPublicData = {
    snapshotId,
    docId: "6e46c006-5541-11ec-bf63-0242ac130002",
    pubKey: sodium.to_base64(signatureKeyPair.publicKey),
    subkeyId: 42,
    keyDerivationTrace: {
      workspaceKeyId: "abc",
      trace: [
        {
          entryId: snapshotId,
          parentId: null,
          subkeyId: 42,
          context: snapshotDerivedKeyContext,
        },
      ],
    },
  };

  const snapshot = createSnapshot(
    "Hello World",
    publicData,
    key,
    signatureKeyPair,
    "",
    ""
  );

  expect(() =>
    verifyAndDecryptSnapshot(
      {
        ...snapshot,
        ciphertext: snapshot.ciphertext.replace(/^./, "a"),
      },
      key,
      signatureKeyPair.publicKey
    )
  ).toThrowError();
});
