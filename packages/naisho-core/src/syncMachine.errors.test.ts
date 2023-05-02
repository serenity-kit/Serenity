import sodiumWrappers from "libsodium-wrappers";
import sodium, { KeyPair } from "react-native-libsodium";
import { assign, interpret, spawn } from "xstate";
import { createSnapshot } from "./snapshot";
import { syncMachine } from "./syncMachine";
import { SnapshotPublicData, UpdatePublicData } from "./types";
import { createUpdate } from "./update";
import { generateId } from "./utils/generateId";

const url = "wss://www.example.com";

let signatureKeyPair: KeyPair;
let key: Uint8Array;
let docId: string;
let snapshotId: string;

beforeEach(() => {
  docId = generateId();
  signatureKeyPair = {
    privateKey: sodiumWrappers.from_base64(
      "g3dtwb9XzhSzZGkxTfg11t1KEIb4D8rO7K54R6dnxArvgg_OzZ2GgREtG7F5LvNp3MS8p9vsio4r6Mq7SZDEgw"
    ),
    publicKey: sodiumWrappers.from_base64(
      "74IPzs2dhoERLRuxeS7zadzEvKfb7IqOK-jKu0mQxIM"
    ),
    keyType: "ed25519",
  };
});

afterEach(() => {});

type CreateSnapshotTestHelperParams = {
  parentSnapshotCiphertext: string;
  grandParentSnapshotProof: string;
  content: string;
};

const createSnapshotTestHelper = (params?: CreateSnapshotTestHelperParams) => {
  snapshotId = generateId();
  const { parentSnapshotCiphertext, grandParentSnapshotProof, content } =
    params || {};
  key = sodiumWrappers.from_hex(
    "724b092810ec86d7e35c9d067702b31ef90bc43a7b598626749914d6a3e033ed"
  );

  const publicData: SnapshotPublicData = {
    snapshotId,
    docId: "6e46c006-5541-11ec-bf63-0242ac130002",
    pubKey: sodium.to_base64(signatureKeyPair.publicKey),
    parentSnapshotClocks: {},
  };

  const snapshot = createSnapshot(
    content || "Hello World",
    publicData,
    key,
    signatureKeyPair,
    parentSnapshotCiphertext || "",
    grandParentSnapshotProof || ""
  );
  return {
    snapshot: {
      ...snapshot,
      serverData: { latestVersion: 0 },
    },
    key,
    signatureKeyPair,
  };
};

type CreateUpdateTestHelperParams = {
  version: number;
};

const createUpdateHelper = (params?: CreateUpdateTestHelperParams) => {
  const version = params?.version || 0;
  const publicData: UpdatePublicData = {
    refSnapshotId: snapshotId,
    docId,
    pubKey: sodium.to_base64(signatureKeyPair.publicKey),
  };

  const update = createUpdate("u", publicData, key, signatureKeyPair, version);

  return { update: { ...update, serverData: { version } } };
};

it("should load a document with updates and two additional updates", (done) => {
  const websocketServiceMock = (context) => () => {};

  let docValue = "";

  const syncService = interpret(
    syncMachine
      .withContext({
        ...syncMachine.context,
        websocketHost: url,
        websocketSessionKey: "sessionKey",
        isValidCollaborator: (signingPublicKey) =>
          sodiumWrappers.to_base64(signatureKeyPair.publicKey) ===
          signingPublicKey,
        getSnapshotKey: () => key,
        applySnapshot: (snapshot) => {
          docValue = sodiumWrappers.to_string(snapshot);
        },
        getUpdateKey: () => key,
        deserializeChanges: (changes) => {
          throw new Error("deserializeChanges not implemented");
        },
        applyChanges: (changes) => {
          changes.forEach((change) => {
            docValue = docValue + change;
          });
        },
        sodium: sodiumWrappers,
        signatureKeyPair,
      })
      .withConfig({
        actions: {
          spawnWebsocketActor: assign((context) => {
            return {
              _websocketActor: spawn(
                websocketServiceMock(context),
                "websocketActor"
              ),
            };
          }),
        },
      })
  ).onTransition((state) => {
    if (state.matches("failed")) {
      expect(state.context._errorTrace[0]).toBeInstanceOf(Error);
      done();
    }
  });

  syncService.start();
  syncService.send({ type: "WEBSOCKET_CONNECTED" });

  const { snapshot } = createSnapshotTestHelper();
  syncService.send({
    type: "WEBSOCKET_ADD_TO_INCOMING_QUEUE",
    data: {
      type: "document",
      snapshot,
      updates: [
        createUpdateHelper().update,
        createUpdateHelper({ version: 1 }).update,
      ],
    },
  });
});
