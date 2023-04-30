import sodiumWrappers from "libsodium-wrappers";
import sodium, { KeyPair } from "react-native-libsodium";
import { assign, interpret, spawn } from "xstate";
import { createSnapshot } from "./snapshot";
import { syncMachine } from "./syncMachine";
import { SnapshotPublicData } from "./types";
import { generateId } from "./utils/generateId";

const url = "wss://www.example.com";

let signatureKeyPair: KeyPair;
let key: Uint8Array;

beforeEach(() => {
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

const createSnapshotHelper = () => {
  key = sodiumWrappers.from_hex(
    "724b092810ec86d7e35c9d067702b31ef90bc43a7b598626749914d6a3e033ed"
  );

  const snapshotId = generateId();
  const publicData: SnapshotPublicData = {
    snapshotId,
    docId: "6e46c006-5541-11ec-bf63-0242ac130002",
    pubKey: sodium.to_base64(signatureKeyPair.publicKey),
    parentSnapshotClocks: {},
  };

  const snapshot = createSnapshot(
    "Hello World",
    publicData,
    key,
    signatureKeyPair,
    "",
    ""
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

it("should connect to the websocket", (done) => {
  const websocketServiceMock = (context) => (callback, onReceive) => {
    // callback({ type: 'resolve', data: { message: 'Success' } });
  };

  const syncService = interpret(
    syncMachine
      .withContext({
        ...syncMachine.context,
        websocketHost: url,
        websocketSessionKey: "sessionKey",
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
    if (state.matches("connected")) {
      done();
    }
  });

  syncService.start();
  syncService.send({ type: "WEBSOCKET_CONNECTED" });
});

it("should load a document", (done) => {
  const websocketServiceMock = (context) => (callback, onReceive) => {
    // callback({ type: 'resolve', data: { message: 'Success' } });
  };

  const syncService = interpret(
    syncMachine
      .withContext({
        ...syncMachine.context,
        websocketHost: url,
        websocketSessionKey: "sessionKey",
        onDocumentLoaded: () => {
          done();
        },
        isValidCollaborator: (signingPublicKey) =>
          sodiumWrappers.to_base64(signatureKeyPair.publicKey) ===
          signingPublicKey,
        getSnapshotKey: () => key,
        sodium: sodiumWrappers,
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
  );

  syncService.start();
  syncService.send({ type: "WEBSOCKET_CONNECTED" });

  const { snapshot } = createSnapshotHelper();
  syncService.send({
    type: "WEBSOCKET_ADD_TO_INCOMING_QUEUE",
    data: {
      type: "document",
      snapshot,
    },
  });
});
