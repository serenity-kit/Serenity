import { useMachine } from "@xstate/react";
import { useEffect, useState } from "react";
import {
  applyAwarenessUpdate,
  Awareness,
  encodeAwarenessUpdate,
  removeAwarenessStates,
} from "y-protocols/awareness";
import * as Yjs from "yjs";
import { syncMachine, SyncMachineConfig } from "../syncMachine";
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
  const { yDoc, yAwareness, onDocumentLoaded, ...rest } = config;
  const [isDocumentLoaded, setIsDocumentLoaded] = useState(false);
  const machine = useMachine(syncMachine, {
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
      onDocumentLoaded: () => {
        setIsDocumentLoaded(true);
        if (onDocumentLoaded) {
          onDocumentLoaded();
        }
      },
    },
  });
  const [, send] = machine;

  useEffect(() => {
    if (!isDocumentLoaded) {
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
  }, [isDocumentLoaded]);

  return machine;
};
