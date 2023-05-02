import sodiumWrappers from "libsodium-wrappers";
import sodium, { KeyPair } from "react-native-libsodium";
import { assign, interpret, spawn } from "xstate";
import { createEphemeralUpdate } from "./ephemeralUpdate";
import { createSnapshot } from "./snapshot";
import { syncMachine } from "./syncMachine";
import {
  EphemeralUpdatePublicData,
  SnapshotPublicData,
  UpdatePublicData,
} from "./types";
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

const createTestEphemeralUpdate = () => {
  const publicData: EphemeralUpdatePublicData = {
    docId,
    pubKey: sodium.to_base64(signatureKeyPair.publicKey),
  };

  const ephemeralUpdate = createEphemeralUpdate(
    new Uint8Array([42]),
    publicData,
    key,
    signatureKeyPair
  );
  return { ephemeralUpdate };
};

it("should process three additional ephemeral updates where the second one fails", (done) => {
  const websocketServiceMock = (context) => () => {};

  let docValue = "";
  let ephemeralUpdatesValue = new Uint8Array();

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
          return changes;
        },
        applyChanges: (changes) => {
          changes.forEach((change) => {
            docValue = docValue + change;
          });
        },
        getEphemeralUpdateKey: () => key,
        applyEphemeralUpdates: (ephemeralUpdates) => {
          ephemeralUpdatesValue = new Uint8Array([
            ...ephemeralUpdatesValue,
            ...ephemeralUpdates,
          ]);
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
    if (ephemeralUpdatesValue.length === 2 && state.matches("connected.idle")) {
      expect(state.context._ephemeralUpdateErrors.length).toEqual(1);
      expect(ephemeralUpdatesValue[0]).toEqual(42);
      expect(ephemeralUpdatesValue[1]).toEqual(42);
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
    },
  });

  const { ephemeralUpdate } = createTestEphemeralUpdate();
  syncService.send({
    type: "WEBSOCKET_ADD_TO_INCOMING_QUEUE",
    data: {
      ...ephemeralUpdate,
      type: "ephemeralUpdate",
    },
  });
  setTimeout(() => {
    const { ephemeralUpdate: ephemeralUpdate2 } = createTestEphemeralUpdate();
    syncService.send({
      type: "WEBSOCKET_ADD_TO_INCOMING_QUEUE",
      data: {
        ...ephemeralUpdate2,
        publicData: {
          ...ephemeralUpdate2.publicData,
          docId: "wrongDocId",
        },
        type: "ephemeralUpdate",
      },
    });
    setTimeout(() => {
      const { ephemeralUpdate: ephemeralUpdate3 } = createTestEphemeralUpdate();
      syncService.send({
        type: "WEBSOCKET_ADD_TO_INCOMING_QUEUE",
        data: {
          ...ephemeralUpdate3,
          type: "ephemeralUpdate",
        },
      });
    }, 1);
  }, 1);
});

it("should store not more than 20 failed ephemeral update errors", (done) => {
  const websocketServiceMock = (context) => () => {};

  let docValue = "";
  let ephemeralUpdatesValue = new Uint8Array();

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
          return changes;
        },
        applyChanges: (changes) => {
          changes.forEach((change) => {
            docValue = docValue + change;
          });
        },
        getEphemeralUpdateKey: () => key,
        applyEphemeralUpdates: (ephemeralUpdates) => {
          ephemeralUpdatesValue = new Uint8Array([
            ...ephemeralUpdatesValue,
            ...ephemeralUpdates,
          ]);
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
    if (ephemeralUpdatesValue.length === 2 && state.matches("connected.idle")) {
      expect(state.context._ephemeralUpdateErrors.length).toEqual(20);
      expect(ephemeralUpdatesValue[0]).toEqual(42);
      expect(ephemeralUpdatesValue[1]).toEqual(42);
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
    },
  });

  const { ephemeralUpdate } = createTestEphemeralUpdate();
  for (let step = 0; step < 25; step++) {
    syncService.send({
      type: "WEBSOCKET_ADD_TO_INCOMING_QUEUE",
      data: {
        ...ephemeralUpdate,
        type: "ephemeralUpdate",
      },
    });
  }

  setTimeout(() => {
    const { ephemeralUpdate: ephemeralUpdate2 } = createTestEphemeralUpdate();
    syncService.send({
      type: "WEBSOCKET_ADD_TO_INCOMING_QUEUE",
      data: {
        ...ephemeralUpdate2,
        type: "ephemeralUpdate",
      },
    });
  }, 1);
});

// test sending the same update twice
// testing sending the same ephemeral update twice
