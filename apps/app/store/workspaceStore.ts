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
import { isValidDeviceSigningPublicKey } from "../utils/isValidDeviceSigningPublicKey/isValidDeviceSigningPublicKey";
import { showToast } from "../utils/toast/showToast";
import * as sql from "./sql/sql";
import { getLocalUsersByIds } from "./userStore";
import { loadRemoteWorkspaceChain } from "./workspaceChainStore";
import {
  getLocalOrLoadRemoteWorkspaceMemberDevicesProofQueryByHash,
  useLocalLastWorkspaceMemberDevicesProof,
} from "./workspaceMemberDevicesProofStore";

export const table = "workspace_v2";

export const initialize = () => {
  sql.execute(
    `CREATE TABLE IF NOT EXISTS ${table} (
      "id"	TEXT,
      "name"	TEXT NOT NULL,
      "avatar"	TEXT,
      "remoteDeleted"	INTEGER NOT NULL,
      "lastOpenDocumentId"	TEXT,
      PRIMARY KEY("id")
    );`
  );
};

export const wipeCaches = () => {
  getWorkspacesCache = [];
};

type Workspace = {
  id: string;
  name: string;
  avatar?: string;
  remoteDeleted: number; // 0 or 1
  lastOpenDocumentId?: string;
};

export const createWorkspace = (params: Omit<Workspace, "remoteDeleted">) => {
  sql.execute(`INSERT INTO ${table} VALUES (?, ?, ?, ?, ?);`, [
    params.id,
    params.name,
    params.avatar || null,
    0,
    null,
  ]);
  triggerGetWorkspaces();
};

export const updateLastOpenDocumentId = ({
  documentId,
  workspaceId,
}: {
  documentId: string;
  workspaceId: string;
}) => {
  sql.execute(`UPDATE ${table} SET lastOpenDocumentId = ? WHERE id = ?`, [
    documentId,
    workspaceId,
  ]);
  triggerGetWorkspaces();
};

export const getLastOpenDocumentId = ({
  workspaceId,
}: {
  workspaceId: string;
}) => {
  const workspace = sql.execute(`SELECT * FROM ${table} WHERE id = ?`, [
    workspaceId,
  ]) as Workspace[];
  return workspace[0]?.lastOpenDocumentId;
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
    workspacesQueryResult.data.workspaces.nodes.map(async (workspace) => {
      if (workspace === null || workspace === undefined) return null;

      let workspaceListName = "";
      if (
        workspace.infoCiphertext &&
        workspace.infoNonce &&
        workspace.infoWorkspaceKey?.workspaceKeyBox &&
        activeDevice
      ) {
        const workspaceKey = decryptWorkspaceKey({
          ciphertext: workspace.infoWorkspaceKey?.workspaceKeyBox?.ciphertext,
          nonce: workspace.infoWorkspaceKey?.workspaceKeyBox?.nonce,
          creatorDeviceEncryptionPublicKey:
            workspace.infoWorkspaceKey?.workspaceKeyBox?.creatorDevice
              .encryptionPublicKey,
          receiverDeviceEncryptionPrivateKey:
            activeDevice?.encryptionPrivateKey,
          workspaceId: workspace.id,
          workspaceKeyId: workspace.infoWorkspaceKey?.id,
        });

        const workspaceMemberDevicesProof =
          await getLocalOrLoadRemoteWorkspaceMemberDevicesProofQueryByHash({
            workspaceId: workspace.id,
            hash: workspace.infoWorkspaceMemberDevicesProofHash,
          });
        if (!workspaceMemberDevicesProof) {
          throw new Error("workspaceMemberDevicesProof not found");
        }

        const isValid = isValidDeviceSigningPublicKey({
          signingPublicKey: workspace.infoCreatorDeviceSigningPublicKey,
          workspaceMemberDevicesProofEntry: workspaceMemberDevicesProof,
          workspaceId: workspace.id,
          minimumRole: "ADMIN",
        });
        if (!isValid) {
          throw new Error(
            "Invalid signing public key for the workspaceMemberDevicesProof for decryptWorkspaceInfo"
          );
        }

        const decryptedWorkspaceInfo = decryptWorkspaceInfo({
          ciphertext: workspace.infoCiphertext,
          nonce: workspace.infoNonce,
          signature: workspace.infoSignature,
          key: workspaceKey,
          workspaceId: workspace.id,
          workspaceKeyId: workspace.infoWorkspaceKey.id,
          workspaceMemberDevicesProof: workspaceMemberDevicesProof.proof,
          creatorDeviceSigningPublicKey:
            workspace.infoCreatorDeviceSigningPublicKey,
        });
        if (
          decryptedWorkspaceInfo &&
          typeof decryptedWorkspaceInfo.name === "string"
        ) {
          workspaceListName = decryptedWorkspaceInfo.name as string;
          sql.execute(`REPLACE INTO ${table} VALUES (?, ?, ?, ?, ?);`, [
            workspace.id,
            workspaceListName,
            decryptedWorkspaceInfo.avatar || null,
            0,
            null,
          ]);
        }
      }
    });
    triggerGetWorkspaces();
  }
};

export const useWorkspaceMembers = ({
  workspaceId,
}: {
  workspaceId: string;
}) => {
  const lastWorkspaceMemberDevicesProof =
    useLocalLastWorkspaceMemberDevicesProof({ workspaceId });
  if (!lastWorkspaceMemberDevicesProof) return [];
  const userIds = Object.keys(
    lastWorkspaceMemberDevicesProof.data.userChainHashes
  );

  return getLocalUsersByIds(userIds);
};

const useWorkspaceMemberDevicesToUsernamesCache: {
  [workspaceId: string]: Record<string, string>;
} = {};
export const useWorkspaceMemberDevicesToUsernames = ({
  workspaceId,
}: {
  workspaceId: string;
}) => {
  const devicesToUsernames: Record<string, string> = {};
  const users = useWorkspaceMembers({ workspaceId });
  users.map((user) => {
    Object.keys(user.devices).map((deviceSigningPublicKey) => {
      devicesToUsernames[deviceSigningPublicKey] = user.username;
    });
  });

  if (
    useWorkspaceMemberDevicesToUsernamesCache[workspaceId] &&
    canonicalize(useWorkspaceMemberDevicesToUsernamesCache[workspaceId]) ===
      canonicalize(devicesToUsernames)
  ) {
    return useWorkspaceMemberDevicesToUsernamesCache[workspaceId];
  }

  useWorkspaceMemberDevicesToUsernamesCache[workspaceId] = devicesToUsernames;
  return devicesToUsernames;
};
