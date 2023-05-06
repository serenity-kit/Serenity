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

it("should connect to the websocket", (done) => {
  const websocketServiceMock = (context) => () => {};

  const syncService = interpret(
    syncMachine
      .withContext({
        ...syncMachine.context,
        websocketHost: url,
        websocketSessionKey: "sessionKey",
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
    if (state.matches("connected")) {
      done();
    }
  });

  syncService.start();
  syncService.send({ type: "WEBSOCKET_CONNECTED" });
});

it("should initially be in loadingDocument state", (done) => {
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
    if (state.matches("connected.loadingDocument")) {
      expect(state.context._documentWasLoaded).toEqual(false);
      expect(docValue).toEqual("");
      done();
    }
  });

  syncService.start();
  syncService.send({ type: "WEBSOCKET_CONNECTED" });
});

it("should load a document", (done) => {
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
    if (state.matches("connected.idle")) {
      expect(docValue).toEqual("Hello World");
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
});

it("should load a document with updates", (done) => {
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
          return changes;
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
    if (state.matches("connected.idle")) {
      expect(docValue).toEqual("Hello Worlduu");
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

it("should load a document and two additional updates", (done) => {
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
          return changes;
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
    if (docValue === "Hello Worlduu") {
      expect(state.context._documentWasLoaded).toBe(true);
      done();
    }
  });

  syncService.start();
  syncService.send({ type: "WEBSOCKET_CONNECTED" });

  expect(syncService.getSnapshot().context._documentWasLoaded).toBe(false);

  const { snapshot } = createSnapshotTestHelper();
  syncService.send({
    type: "WEBSOCKET_ADD_TO_INCOMING_QUEUE",
    data: {
      type: "document",
      snapshot,
    },
  });

  const { update } = createUpdateHelper();
  syncService.send({
    type: "WEBSOCKET_ADD_TO_INCOMING_QUEUE",
    data: {
      ...update,
      type: "update",
    },
  });

  const { update: update2 } = createUpdateHelper({ version: 1 });
  syncService.send({
    type: "WEBSOCKET_ADD_TO_INCOMING_QUEUE",
    data: {
      ...update2,
      type: "update",
    },
  });
});

it("should load a document and an additional snapshot", (done) => {
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
          return changes;
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
    if (docValue === "Hello World again") {
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

  const { snapshot: snapshot2 } = createSnapshotTestHelper({
    parentSnapshotCiphertext: snapshot.ciphertext,
    grandParentSnapshotProof: snapshot.publicData.parentSnapshotProof,
    content: "Hello World again",
  });
  syncService.send({
    type: "WEBSOCKET_ADD_TO_INCOMING_QUEUE",
    data: {
      type: "snapshot",
      snapshot: snapshot2,
    },
  });
});

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
          return changes;
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
    if (docValue === "Hello Worlduuuu") {
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

  const { update } = createUpdateHelper({ version: 2 });
  syncService.send({
    type: "WEBSOCKET_ADD_TO_INCOMING_QUEUE",
    data: {
      ...update,
      type: "update",
    },
  });

  const { update: update2 } = createUpdateHelper({ version: 3 });
  syncService.send({
    type: "WEBSOCKET_ADD_TO_INCOMING_QUEUE",
    data: {
      ...update2,
      type: "update",
    },
  });
});

it("should load a document with updates and two two additional snapshots", (done) => {
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
          return changes;
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
    if (docValue === "Hello World again and again") {
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

  const { snapshot: snapshot2 } = createSnapshotTestHelper({
    parentSnapshotCiphertext: snapshot.ciphertext,
    grandParentSnapshotProof: snapshot.publicData.parentSnapshotProof,
    content: "Hello World again",
  });
  syncService.send({
    type: "WEBSOCKET_ADD_TO_INCOMING_QUEUE",
    data: {
      type: "snapshot",
      snapshot: snapshot2,
    },
  });

  const { snapshot: snapshot3 } = createSnapshotTestHelper({
    parentSnapshotCiphertext: snapshot2.ciphertext,
    grandParentSnapshotProof: snapshot2.publicData.parentSnapshotProof,
    content: "Hello World again and again",
  });
  syncService.send({
    type: "WEBSOCKET_ADD_TO_INCOMING_QUEUE",
    data: {
      type: "snapshot",
      snapshot: snapshot3,
    },
  });
});

it("should load a document and process three additional ephemeral updates", (done) => {
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
    if (ephemeralUpdatesValue.length === 3) {
      expect(ephemeralUpdatesValue[0]).toEqual(42);
      expect(ephemeralUpdatesValue[1]).toEqual(42);
      expect(ephemeralUpdatesValue[2]).toEqual(42);
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
