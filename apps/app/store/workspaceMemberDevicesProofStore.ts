import * as workspaceMemberDevicesProofUtil from "@serenity-kit/workspace-member-devices-proof";
import { generateId, notNull, notUndefined } from "@serenity-tools/common";
import canonicalize from "canonicalize";
import { useSyncExternalStore } from "react";
import {
  runWorkspaceMemberDevicesProofQuery,
  runWorkspaceMemberDevicesProofsQuery,
} from "../generated/graphql";
import { showToast } from "../utils/toast/showToast";
import * as sql from "./sql/sql";
import {
  getWorkspaceChainEventByHash,
  loadRemoteWorkspaceChain,
} from "./workspaceChainStore";
import * as workspaceStore from "./workspaceStore";

export const table = "workspace_member_devices_proof_v2";

export const initialize = () => {
  sql.execute(
    `CREATE TABLE IF NOT EXISTS "${table}" (
      "clock"	INTEGER NOT NULL,
      "proof"	TEXT NOT NULL,
      "data"	TEXT NOT NULL,
      "hash"	TEXT NOT NULL,
      "authorMainDeviceSigningPublicKey"	TEXT NOT NULL,
      "workspaceId"	TEXT NOT NULL,
      PRIMARY KEY("clock","workspaceId")
      FOREIGN KEY("workspaceId") REFERENCES "${workspaceStore.table}" ON DELETE CASCADE
    );`
  );
};

export const wipeCaches = () => {
  getLastWorkspaceMemberDevicesProofCache = {};
};

export type WorkspaceMemberDevicesProofLocalDbEntry = {
  proof: workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProof;
  data: workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProofData;
  clock: workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProofClock;
};

export const createWorkspaceMemberDevicesProof = ({
  workspaceId,
  proof,
  data,
  clock,
  authorMainDeviceSigningPublicKey,
  triggerRerender,
}: {
  workspaceId: string;
  proof: workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProof;
  data: workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProofData;
  clock: workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProofClock;
  authorMainDeviceSigningPublicKey: string;
  triggerRerender?: boolean;
}) => {
  // we don't want to overwrite existing entries
  sql.execute(`INSERT OR IGNORE INTO  ${table} VALUES (?, ?, ?, ?, ?, ?);`, [
    clock,
    JSON.stringify(proof),
    JSON.stringify(data),
    proof.hash,
    authorMainDeviceSigningPublicKey,
    workspaceId,
  ]);
  if (triggerRerender !== false) {
    triggerGetLastWorkspaceMemberDevicesProof();
  }
};

export const loadRemoteWorkspaceMemberDevicesProofsQuery = async () => {
  const workspaceMemberDevicesProofsQueryResult =
    await runWorkspaceMemberDevicesProofsQuery({});

  if (workspaceMemberDevicesProofsQueryResult.error) {
    showToast(
      "Failed to load the workspace data (memberDeviceProofs).",
      "error"
    );
  }

  if (
    !workspaceMemberDevicesProofsQueryResult.data?.workspaceMemberDevicesProofs
      ?.nodes
  ) {
    return [];
  }

  const workspaceIds: string[] = [];
  for (const entry of workspaceMemberDevicesProofsQueryResult.data.workspaceMemberDevicesProofs.nodes
    .filter(notNull)
    .filter(notUndefined)) {
    workspaceIds.push(entry.workspaceId);

    const data =
      workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProofData.parse(
        JSON.parse(entry.serializedData)
      );
    const proof =
      workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProof.parse(
        entry.proof
      );

    // load latest workspace chain entries and check if the workspace chain event is included
    // to verify that the server is providing this or a newer workspace chain
    await loadRemoteWorkspaceChain({
      workspaceId: entry.workspaceId,
    });
    const workspaceChainEvent = getWorkspaceChainEventByHash({
      hash: data.workspaceChainHash,
      workspaceId: entry.workspaceId,
    });
    if (!workspaceChainEvent) {
      throw new Error(
        "Workspace chain event not found in the current workspace chain"
      );
    }

    const lastWorkspaceMemberDevicesProofEntry =
      getLastWorkspaceMemberDevicesProof({
        workspaceId: entry.workspaceId,
      });

    const lastWorkspaceMemberDevicesProof = lastWorkspaceMemberDevicesProofEntry
      ? lastWorkspaceMemberDevicesProofEntry.proof
      : undefined;

    // we ignore the entry if it is already in the database
    if (
      lastWorkspaceMemberDevicesProof &&
      lastWorkspaceMemberDevicesProof.clock === proof.clock
    ) {
      continue;
    }

    const isValid =
      workspaceMemberDevicesProofUtil.isValidWorkspaceMemberDevicesProof({
        authorPublicKey: entry.authorMainDeviceSigningPublicKey,
        workspaceMemberDevicesProof: proof,
        workspaceMemberDevicesProofData: data,
        pastKnownWorkspaceMemberDevicesProof: lastWorkspaceMemberDevicesProof,
      });
    if (!isValid) {
      throw new Error("Invalid workspace member devices proof");
    }
    createWorkspaceMemberDevicesProof({
      authorMainDeviceSigningPublicKey: entry.authorMainDeviceSigningPublicKey,
      clock: proof.clock,
      data,
      proof: proof,
      workspaceId: entry.workspaceId,
    });
  }

  return workspaceIds.map((workspaceId) => {
    return {
      ...getLastWorkspaceMemberDevicesProof({ workspaceId }),
      workspaceId,
    };
  });
};

export const loadRemoteWorkspaceMemberDevicesProofQuery = async ({
  workspaceId,
  invitationId,
}: {
  workspaceId: string;
  invitationId?: string;
}) => {
  const workspaceMemberDevicesProofQueryResult =
    await runWorkspaceMemberDevicesProofQuery({ workspaceId, invitationId });

  if (workspaceMemberDevicesProofQueryResult.error) {
    showToast("Failed to load the workspace data.", "error");
  }

  if (
    workspaceMemberDevicesProofQueryResult.data?.workspaceMemberDevicesProof
  ) {
    const entry =
      workspaceMemberDevicesProofQueryResult.data.workspaceMemberDevicesProof;
    const data =
      workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProofData.parse(
        JSON.parse(entry.serializedData)
      );
    const proof =
      workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProof.parse(
        entry.proof
      );

    // load latest workspace chain entries and check if the workspace chain event is included
    // to verify that the server is providing this or a newer workspace chain
    await loadRemoteWorkspaceChain({ workspaceId });
    const workspaceChainEvent = getWorkspaceChainEventByHash({
      hash: data.workspaceChainHash,
      workspaceId,
    });
    if (!workspaceChainEvent) {
      throw new Error(
        "Workspace chain event not found in the current workspace chain"
      );
    }

    const lastWorkspaceMemberDevicesProofEntry =
      getLastWorkspaceMemberDevicesProof({
        workspaceId,
      });
    const lastWorkspaceMemberDevicesProof = lastWorkspaceMemberDevicesProofEntry
      ? lastWorkspaceMemberDevicesProofEntry.proof
      : undefined;

    // we ignore the entry if it is already in the database
    if (
      lastWorkspaceMemberDevicesProof &&
      lastWorkspaceMemberDevicesProof.clock === proof.clock
    ) {
      return getLastWorkspaceMemberDevicesProof({ workspaceId });
    }

    if (
      !workspaceMemberDevicesProofUtil.isValidWorkspaceMemberDevicesProof({
        workspaceMemberDevicesProof: proof,
        // TODO verify the author was part of the chain at entry - workspaceMemberDevicesProofData.workspaceChainHash
        authorPublicKey: entry.authorMainDeviceSigningPublicKey,
        workspaceMemberDevicesProofData: data,
        pastKnownWorkspaceMemberDevicesProof: lastWorkspaceMemberDevicesProof,
      })
    ) {
      throw new Error(
        "Invalid workspaceMemberDevicesProof in updateWorkspaceMemberDevicesProof"
      );
    }
    createWorkspaceMemberDevicesProof({
      authorMainDeviceSigningPublicKey: entry.authorMainDeviceSigningPublicKey,
      clock: proof.clock,
      data,
      proof,
      workspaceId,
    });
  }
  return getLastWorkspaceMemberDevicesProof({ workspaceId });
};

export const getLocalOrLoadRemoteWorkspaceMemberDevicesProofQueryByHash =
  async ({ workspaceId, hash }: { workspaceId: string; hash: string }) => {
    // get the local entry if it exists
    const localWorkspaceMemberDevicesProof =
      getWorkspaceMemberDevicesProofByHash({ workspaceId, hash });
    if (localWorkspaceMemberDevicesProof) {
      return localWorkspaceMemberDevicesProof;
    }

    // get the remove entry
    const workspaceMemberDevicesProofQueryResult =
      await runWorkspaceMemberDevicesProofQuery({ workspaceId, hash });

    if (workspaceMemberDevicesProofQueryResult.error) {
      showToast("Failed to load the workspace data.", "error");
    }

    if (
      workspaceMemberDevicesProofQueryResult.data?.workspaceMemberDevicesProof
    ) {
      const entry =
        workspaceMemberDevicesProofQueryResult.data.workspaceMemberDevicesProof;
      const data =
        workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProofData.parse(
          JSON.parse(entry.serializedData)
        );
      const proof =
        workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProof.parse(
          entry.proof
        );

      // load latest workspace chain entries and check if the workspace chain event is included
      // to verify that the server is providing this or a newer workspace chain
      await loadRemoteWorkspaceChain({ workspaceId });
      const workspaceChainEvent = getWorkspaceChainEventByHash({
        hash: data.workspaceChainHash,
        workspaceId,
      });
      if (!workspaceChainEvent) {
        throw new Error(
          "Workspace chain event not found in the current workspace chain"
        );
      }

      const workspaceMemberDevicesProofEntry =
        getWorkspaceMemberDevicesProofByHash({
          workspaceId,
          hash,
        });
      const workspaceMemberDevicesProof = workspaceMemberDevicesProofEntry
        ? workspaceMemberDevicesProofEntry.proof
        : undefined;

      // ignore the incoming entry if it is already in the database (e.g. due concurrency) and
      // return the local entry
      if (
        workspaceMemberDevicesProof &&
        workspaceMemberDevicesProof.clock === proof.clock
      ) {
        return getWorkspaceMemberDevicesProofByHash({ workspaceId, hash });
      }

      if (
        !workspaceMemberDevicesProofUtil.isValidWorkspaceMemberDevicesProof({
          workspaceMemberDevicesProof: proof,
          // TODO verify the author was part of the chain at entry - workspaceMemberDevicesProofData.workspaceChainHash
          authorPublicKey: entry.authorMainDeviceSigningPublicKey,
          workspaceMemberDevicesProofData: data,
          pastKnownWorkspaceMemberDevicesProof: workspaceMemberDevicesProof,
        })
      ) {
        throw new Error(
          "Invalid workspaceMemberDevicesProof in updateWorkspaceMemberDevicesProof"
        );
      }
      createWorkspaceMemberDevicesProof({
        authorMainDeviceSigningPublicKey:
          entry.authorMainDeviceSigningPublicKey,
        clock: proof.clock,
        data,
        proof,
        workspaceId,
      });
    }
    return getWorkspaceMemberDevicesProofByHash({ workspaceId, hash });
  };

let getLastWorkspaceMemberDevicesProofCache: {
  [workspaceId: string]: WorkspaceMemberDevicesProofLocalDbEntry;
} = {};
export const getLastWorkspaceMemberDevicesProof = ({
  workspaceId,
}: {
  workspaceId: string;
}) => {
  // TODO create helper to get one
  const lastWorkspaceMemberDevicesProofResult = sql.execute(
    `SELECT * FROM ${table} WHERE workspaceId = ? ORDER BY clock DESC LIMIT 1`,
    [workspaceId]
  ) as any;
  const lastWorkspaceMemberDevicesProof =
    lastWorkspaceMemberDevicesProofResult.length > 0
      ? {
          clock: lastWorkspaceMemberDevicesProofResult[0].clock,
          proof: JSON.parse(lastWorkspaceMemberDevicesProofResult[0].proof),
          data: JSON.parse(lastWorkspaceMemberDevicesProofResult[0].data),
        }
      : undefined;

  // write a helper to canonicalize the input params and create a cache based on them
  if (
    lastWorkspaceMemberDevicesProof &&
    canonicalize(lastWorkspaceMemberDevicesProof) !==
      canonicalize(getLastWorkspaceMemberDevicesProofCache[workspaceId])
  ) {
    getLastWorkspaceMemberDevicesProofCache[workspaceId] =
      lastWorkspaceMemberDevicesProof;
  }
  return getLastWorkspaceMemberDevicesProofCache[workspaceId];
};

export const getWorkspaceMemberDevicesProofByHash = ({
  workspaceId,
  hash,
}: {
  workspaceId: string;
  hash: string;
}) => {
  // TODO create helper to get one
  const workspaceMemberDevicesProofResult = sql.execute(
    `SELECT * FROM ${table} WHERE workspaceId = ? AND hash = ? LIMIT 1`,
    [workspaceId, hash]
  ) as any;
  const workspaceMemberDevicesProof =
    workspaceMemberDevicesProofResult.length > 0
      ? {
          clock: workspaceMemberDevicesProofResult[0].clock,
          proof: JSON.parse(workspaceMemberDevicesProofResult[0].proof),
          data: JSON.parse(workspaceMemberDevicesProofResult[0].data),
        }
      : undefined;
  return workspaceMemberDevicesProof;
};

const getLastWorkspaceMemberDevicesProofListeners: {
  [id: string]: () => void;
} = {};
export const triggerGetLastWorkspaceMemberDevicesProof = () => {
  Object.values(getLastWorkspaceMemberDevicesProofListeners).forEach(
    (listener) => listener()
  );
};

export const useLocalLastWorkspaceMemberDevicesProof = ({
  workspaceId,
}: {
  workspaceId: string;
}) => {
  const result = useSyncExternalStore(
    (onStoreChange) => {
      const id = generateId();
      getLastWorkspaceMemberDevicesProofListeners[id] = onStoreChange;
      return () => {
        delete getLastWorkspaceMemberDevicesProofListeners[id];
      };
    },
    () => getLastWorkspaceMemberDevicesProof({ workspaceId })
  );

  return result;
};
