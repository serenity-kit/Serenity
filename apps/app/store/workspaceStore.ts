import {
  LocalDevice,
  decryptWorkspaceInfo,
  decryptWorkspaceKey,
  generateId,
  notUndefined,
} from "@serenity-tools/common";
import canonicalize from "canonicalize";
import { useSyncExternalStore } from "react";
import { runWorkspacesQuery } from "../generated/graphql";
import { showToast } from "../utils/toast/showToast";
import * as sql from "./sql/sql";
import { loadRemoteWorkspaceChain } from "./workspaceChainStore";

export const table = "workspace_v1";

export const initialize = async () => {
  await sql.ready();

  sql.execute(
    `CREATE TABLE IF NOT EXISTS ${table} (
      "id"	TEXT,
      "name"	TEXT NOT NULL,
      "remoteDeleted"	INTEGER NOT NULL,
      PRIMARY KEY("id")
    );`
  );
};

type Workspace = {
  id: string;
  name: string;
  remoteDeleted: number; // 0 or 1
};

export const createWorkspace = (params: Omit<Workspace, "remoteDeleted">) => {
  sql.execute(`INSERT INTO ${table} VALUES (?, ?, ?);`, [
    params.id,
    params.name,
    0,
  ]);
  triggerGetWorkspaces();
};

let getWorkspacesCache: Workspace[] = [];
export const getWorkspaces = () => {
  const workspaces = sql.execute(`SELECT * FROM ${table}`) as Workspace[];
  if (
    workspaces.length === getWorkspacesCache.length &&
    canonicalize(workspaces) === canonicalize(getWorkspacesCache)
  ) {
    return getWorkspacesCache;
  }
  getWorkspacesCache = workspaces;
  return getWorkspacesCache;
};

const getWorkspacesListeners: { [id: string]: () => void } = {};
const triggerGetWorkspaces = () => {
  Object.values(getWorkspacesListeners).forEach((listener) => listener());
};

export const useLocalWorkspaces = () => {
  const workspaces = useSyncExternalStore((onStoreChange) => {
    const id = generateId();
    getWorkspacesListeners[id] = onStoreChange;
    return () => {
      delete getWorkspacesListeners[id];
    };
  }, getWorkspaces);

  return { workspaces };
};

export const loadRemoteWorkspaceDetails = async ({
  workspaceId,
}: {
  workspaceId: string;
}) => {
  // TODO load the workspaceDetails

  await loadRemoteWorkspaceChain({ workspaceId });
};

export const loadRemoteWorkspaces = async ({
  activeDevice,
}: {
  activeDevice: LocalDevice;
}) => {
  const workspacesQueryResult = await runWorkspacesQuery({
    deviceSigningPublicKey: activeDevice.signingPublicKey,
  });

  if (workspacesQueryResult.error) {
    showToast("Failed to load workspaces data.", "error");
  }

  if (workspacesQueryResult.data?.workspaces?.nodes) {
    // identify and set remotely deleted workspaces
    const localWorkspaceIds = getWorkspaces().map((workspace) => workspace.id);
    const remoteWorkspaceIds = workspacesQueryResult.data.workspaces.nodes
      .map((workspace) => workspace?.id)
      .filter(notUndefined);
    const onlyLocalWorkspaceIds = localWorkspaceIds.filter(
      (workspaceId) => !remoteWorkspaceIds.includes(workspaceId)
    );
    onlyLocalWorkspaceIds.forEach((workspaceId) => {
      sql.execute(`UPDATE ${table} SET remoteDeleted = 1 WHERE id = ?`, [
        workspaceId,
      ]);
    });

    // decrypt workspace info and update local db
    workspacesQueryResult.data.workspaces.nodes.map((workspace) => {
      if (workspace === null || workspace === undefined) return null;

      let workspaceListName = "";
      if (
        workspace.infoCiphertext &&
        workspace.infoNonce &&
        workspace.infoWorkspaceKey?.workspaceKeyBox &&
        activeDevice
      ) {
        // TODO verify that creator
        // needs a workspace key chain with a main device!
        const workspaceKey = decryptWorkspaceKey({
          ciphertext: workspace.infoWorkspaceKey?.workspaceKeyBox?.ciphertext,
          nonce: workspace.infoWorkspaceKey?.workspaceKeyBox?.nonce,
          creatorDeviceEncryptionPublicKey:
            workspace.infoWorkspaceKey?.workspaceKeyBox?.creatorDevice
              .encryptionPublicKey,
          receiverDeviceEncryptionPrivateKey:
            activeDevice?.encryptionPrivateKey,
        });
        const decryptedWorkspaceInfo = decryptWorkspaceInfo({
          ciphertext: workspace.infoCiphertext,
          nonce: workspace.infoNonce,
          key: workspaceKey,
        });
        if (
          decryptedWorkspaceInfo &&
          typeof decryptedWorkspaceInfo.name === "string"
        ) {
          workspaceListName = decryptedWorkspaceInfo.name as string;
          sql.execute(`REPLACE INTO ${table} VALUES (?, ?, ?);`, [
            workspace.id,
            workspaceListName,
            0,
          ]);
        }
      }
    });
    triggerGetWorkspaces();
  }
};
