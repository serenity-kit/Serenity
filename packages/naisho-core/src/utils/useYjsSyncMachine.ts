import { useMachine } from "@xstate/react";
import { useEffect, useState } from "react";
import {
  Awareness,
  applyAwarenessUpdate,
  encodeAwarenessUpdate,
  removeAwarenessStates,
} from "y-protocols/awareness";
import * as Yjs from "yjs";
import { createSyncMachine } from "../createSyncMachine";
import { SyncMachineConfig } from "../types";
import { deserializeUint8ArrayUpdates } from "./deserializeUint8ArrayUpdates";
import { serializeUint8ArrayUpdates } from "./serializeUint8ArrayUpdates";

export type YjsSyncMachineConfig = Omit<
  SyncMachineConfig,
  | "applySnapshot"
  | "applyChanges"
  | "applyEphemeralUpdates"
  | "serializeChanges"
  | "deserializeChanges"
> & {
  yDoc: Yjs.Doc;
  yAwareness: Awareness;
};

export const useYjsSyncMachine = (config: YjsSyncMachineConfig) => {
  const { yDoc, yAwareness, ...rest } = config;
  const [isDocumentLoaded, setIsDocumentLoaded] = useState(false);
  // necessary to avoid that the same machine context is re-used for different or remounted pages
  // more info here:
  //
  // How to reproduce A:
  // 1. Open a Document a
  // 2. Open a Document b
  // 3. Open Document a again
  // How to reproduce B:
  // 1. Open a Document a
  // 2. During timeout click the Reload button
  //
  // more info: https://github.com/statelyai/xstate/issues/1101
  // related: https://github.com/statelyai/xstate/discussions/1825
  const [syncMachine1] = useState(() => createSyncMachine());
  const machine = useMachine(syncMachine1, {
    context: {
      ...rest,
      applySnapshot: (decryptedSnapshotData) => {
        Yjs.applyUpdate(config.yDoc, decryptedSnapshotData, "naisho-remote");
      },
      applyChanges: (decryptedChanges) => {
        decryptedChanges.map((change) => {
          Yjs.applyUpdate(config.yDoc, change, "naisho-remote");
        });
      },
      applyEphemeralUpdates: (decryptedEphemeralUpdates) => {
        decryptedEphemeralUpdates.map((ephemeralUpdate) => {
          applyAwarenessUpdate(config.yAwareness, ephemeralUpdate, null);
        });
      },
      serializeChanges: serializeUint8ArrayUpdates,
      deserializeChanges: deserializeUint8ArrayUpdates,
    },
  });
  const [state, send] = machine;

  useEffect(() => {
    // only connect after the document loaded
    if (!state.matches("connected") || !state.context._documentWasLoaded) {
      return;
    }

    const onAwarenessUpdate = ({ added, updated, removed }) => {
      const changedClients = added.concat(updated).concat(removed);
      const yAwarenessUpdate = encodeAwarenessUpdate(
        yAwareness,
        changedClients
      );
      send({ type: "ADD_EPHEMERAL_UPDATE", data: yAwarenessUpdate });
    };
    const onUpdate = (update, origin) => {
      if (origin?.key === "y-sync$" || origin === "mobile-webview") {
        send({ type: "ADD_CHANGE", data: update });
      }
    };

    yAwareness.on("update", onAwarenessUpdate);
    // TODO switch to v2 updates
    yDoc.on("update", onUpdate);

    return () => {
      removeAwarenessStates(yAwareness, [yDoc.clientID], "document unmount");
      yAwareness.off("update", onAwarenessUpdate);
      yDoc.off("update", onUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.value]);

  return machine;
};
